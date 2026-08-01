//! The host rim — deliberately thin, verified by running. One tao window; the
//! sidebar as a naked strip beside the tiling area (`geometry::reserve`, host.md
//! §Sidebar) and a wry child webview per leaf of the field's tile tree inside
//! what it leaves (`tree::read` → `geometry::walk`); per-webview IPC handlers
//! (host.md §Transport) dispatching through the `EngineApi` seam. The rim
//! chooses the implementor at runtime: the real `engine::Engine` behind
//! `EngineAdapter` by default (the swap, board.md build track step 5), the
//! `FixtureStub` under `--fixture`.
//!
//! The tile tree is field-driven: the rim reads the active session's current
//! tab through the engine and re-reads it on every commit that moves
//! placements — the active db's commit broadcast (the same stream the engine's
//! reactivity drinks) reaches the loop as [`RimEvent::TreeChanged`]. A commit
//! that splits the tree relayouts the window; nothing is rim-composed except
//! under `--fixture`, where `field::demo()` stays the whole field.
//!
//! A program whose source entry exists on disk is served over the `ol://`
//! custom protocol (`serve`, `transpile`) — the empty shell plus its own
//! modules, transpiled per file; the surfaces without one keep [`demo_page`]
//! until theirs is written. Everything with logic lives in the pure modules;
//! this file wires tao/wry.
//!
//! `--probe` runs the same boot and then asks each mounted surface what its
//! DOM became, one JSON line per webview on stdout, and exits (`probe`).
//! `OL_TIMING=1` logs the open path's stages (`timing`).

use std::borrow::Cow;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use tao::{
    dpi::{LogicalPosition, LogicalSize},
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop, EventLoopBuilder, EventLoopProxy},
    window::{Theme, Window, WindowBuilder},
};
use tokio_stream::StreamExt;
use wry::WebViewBuilder;

use db::ChunkId;
use engine::{HostCmd, ProcessId, TerminalReason};
use host::adapter::EngineAdapter;
use host::boot::{self, Booted, Surface};
use host::compose::{self, ProcessInfo};
use host::dispatch::{self, Context, EngineApi, Outcome, Parsed};
use host::field;
use host::geometry::{self, Bleed, Rect, Spacing, Strip, Tile};
use host::page;
use host::probe;
use host::protocol;
use host::recycle::Pool;
use host::seed;
use host::serve;
use host::stub::FixtureStub;
use host::timing::Timing;
use host::transpile::Transpiler;
use host::tree::{self, TreeView};
use host::webview_runtime::PendingWebview;

// Visual tokens are an open (host.md §What Is Open) — parameters here,
// values settled by eye.
const SPACING: Spacing = Spacing { padding: 14.0, gap: 10.0 };
/// The sidebar's strip, outside tile geometry (host.md §Sidebar). Fixed for
/// now: resizing it is direct manipulation, which is spec-gated.
///
/// The bleed is the room the column's *surroundings* need and the column
/// itself does not use: 14 on the left and 10 at each end for the item
/// shadows, 8 on the right as the overlay scrollbar's lane. The sidebar
/// program insets its column by the same numbers, so the first card still sits
/// exactly on the window's padding line.
const STRIP: Strip = Strip {
    width: 216.0,
    bleed: Bleed { left: 14.0, top: 10.0, right: 8.0, bottom: 10.0 },
};
/// The window's canvas (host.md §Visual Language): a quiet gray, `hsl(0 0% 98%)`,
/// that the white cards sit on. Every webview is transparent, so this is the
/// background the whole surface shows through to.
///
/// Set on `NSWindow` directly rather than through
/// `WindowBuilder::with_background_color`: tao 0.30 types a colour as four
/// `u8`s and hands r/g/b straight to `+[NSColor colorWithRed:green:blue:alpha:]`,
/// which reads 0…1 — so through that signature only 0 and 1 survive per channel,
/// and a gray cannot be said at all. AppKit takes the float this way.
#[cfg(target_os = "macos")]
fn paint_canvas(window: &Window) {
    use objc2::runtime::AnyObject;
    use objc2::{class, msg_send};
    use tao::platform::macos::WindowExtMacOS;

    // sRGB, the space the surfaces' CSS is written in — 250/255 is `98%`.
    const LEVEL: f64 = 250.0 / 255.0;
    let ns_window = window.ns_window() as *mut AnyObject;
    unsafe {
        let color: *mut AnyObject = msg_send![
            class!(NSColor),
            colorWithSRGBRed: LEVEL,
            green: LEVEL,
            blue: LEVEL,
            alpha: 1.0f64,
        ];
        let _: () = msg_send![ns_window, setBackgroundColor: color];
    }
}

#[cfg(not(target_os = "macos"))]
fn paint_canvas(_window: &Window) {}

/// The frame chrome the rim cuts itself, in the same register as [`paint_canvas`]:
/// values settled by eye (host.md §What Is Open, *Visual tokens*).
///
/// A tile floats, and a floating surface casts an aura — but a webview is
/// clipped to its own rect, so the shadow a program draws inside one is cut
/// away exactly where it would show. The aura is therefore the host's, hung on
/// the tile webview's own CoreAnimation layer, which answers to no clipping
/// rect.
///
/// One convention, two homes: `--ol-radius` in @openlight/react must mirror
/// [`CARD_RADIUS`] — the card's corner and the shadow cut to it are the same
/// corner (the spec pass owes this rule a home).
const CARD_RADIUS: f64 = 12.0;
const AURA_RADIUS: f64 = 24.0;
const AURA_OPACITY: f32 = 0.05;

/// The two CoreGraphics handles the aura crosses into. They are opaque, but
/// their objc type encodings are not: the runtime checks the encoding of every
/// argument a message carries, and a bare pointer is a different type to it.
#[cfg(target_os = "macos")]
mod cg {
    use objc2::encode::{Encoding, RefEncode};
    use objc2_foundation::CGRect;
    use std::ffi::c_void;

    #[repr(C)]
    pub struct CGColor {
        _opaque: [u8; 0],
    }
    unsafe impl RefEncode for CGColor {
        const ENCODING_REF: Encoding = Encoding::Pointer(&Encoding::Struct("CGColor", &[]));
    }

    #[repr(C)]
    pub struct CGPath {
        _opaque: [u8; 0],
    }
    unsafe impl RefEncode for CGPath {
        const ENCODING_REF: Encoding = Encoding::Pointer(&Encoding::Struct("CGPath", &[]));
    }

    extern "C" {
        pub fn CGColorCreateGenericGray(gray: f64, alpha: f64) -> *mut CGColor;
        pub fn CGColorRelease(color: *mut CGColor);
        /// CoreGraphics' rounded-rect path; AppKit grew its own only in macOS
        /// 14. A null transform is the identity.
        pub fn CGPathCreateWithRoundedRect(
            rect: CGRect,
            corner_width: f64,
            corner_height: f64,
            transform: *const c_void,
        ) -> *mut CGPath;
        pub fn CGPathRelease(path: *mut CGPath);
    }
}

/// Hang the aura on one tile webview's layer, cut to the size it now has.
/// Called at mount and on every resize: a shadow path is geometry, and does not
/// follow its layer's bounds by itself.
#[cfg(target_os = "macos")]
fn cast_aura(webview: &wry::WebView, rect: &Rect) {
    use objc2::msg_send;
    use objc2::rc::Retained;
    use objc2::runtime::{AnyObject, Bool};
    use objc2_foundation::{CGPoint, CGRect, CGSize};
    use wry::WebViewExtMacOS;

    let view = webview.webview();
    let view = Retained::as_ptr(&view) as *mut AnyObject;
    unsafe {
        let _: () = msg_send![view, setWantsLayer: Bool::YES];
        let layer: *mut AnyObject = msg_send![view, layer];
        if layer.is_null() {
            return; // no layer, no aura — the surface still renders
        }
        // A layer's shadow is painted *outside* the layer; a mask would cut away
        // precisely the part that shows.
        let _: () = msg_send![layer, setMasksToBounds: Bool::NO];
        let black = cg::CGColorCreateGenericGray(0.0, 1.0);
        let _: () = msg_send![layer, setShadowColor: black];
        cg::CGColorRelease(black);
        let _: () = msg_send![layer, setShadowOpacity: AURA_OPACITY];
        let _: () = msg_send![layer, setShadowRadius: AURA_RADIUS];
        // Centred: the default offset is (0, -3), which reads as a light source.
        let _: () = msg_send![layer, setShadowOffset: CGSize::new(0.0, 0.0)];
        // The path is in the layer's own coordinates, and it is what makes the
        // aura cheap: without it CoreAnimation blurs the layer's alpha channel
        // — the live page — every frame.
        let path = cg::CGPathCreateWithRoundedRect(
            CGRect::new(CGPoint::new(0.0, 0.0), CGSize::new(rect.width, rect.height)),
            CARD_RADIUS,
            CARD_RADIUS,
            std::ptr::null(),
        );
        let _: () = msg_send![layer, setShadowPath: path];
        cg::CGPathRelease(path);
    }
}

#[cfg(not(target_os = "macos"))]
fn cast_aura(_webview: &wry::WebView, _rect: &Rect) {}

/// `--probe`: how long a surface gets to mount, read its scope and render
/// before it is asked what its DOM became, and how long the whole run may take.
const PROBE_SETTLE: Duration = Duration::from_millis(2500);
const PROBE_DEADLINE: Duration = Duration::from_secs(20);

/// The loop's user event. The engine's commands cross wrapped; the two rim-own
/// variants are the reactivity seam and the per-view reply channel — a reply
/// must reach exactly the webview that asked (two views may speak as one
/// process, and their SDK request ids are independent counters), while an
/// engine event fans out to every view of its process.
#[derive(Debug)]
enum RimEvent {
    Engine(HostCmd),
    /// A commit moved placements — re-read the tree, reconcile the window.
    TreeChanged,
    Reply { view: ViewKey, script: String },
    /// Build a warm pane for this executable and park it (`recycle`, prewarm
    /// lane) — sent after boot for every program the settings chunk names.
    Prewarm { executable: String },
}

/// Where a webview stands in the window. Keyed apart from process identity:
/// the strip, an overlay, and a tile leaf are the rim's three places, and one
/// process may hold more than one of them (host.md §Transport's per-slot
/// identity is the precedent for several surfaces speaking as one process).
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
enum ViewKey {
    Strip,
    Overlay(ProcessId),
    Tile(String),
}

struct View {
    process: ProcessId,
    /// What built this view's page — the recycle pool's key (`recycle`).
    executable: String,
    /// True when the page is served over `ol://`. Only a served pane can be
    /// renavigated to another process's shell, so only these park.
    served: bool,
    identity: Identity,
    webview: wry::WebView,
}

/// The process a webview currently speaks as. Its handlers (the `ol://`
/// protocol, IPC) are built once with a clone of this and read it per request,
/// so a recycled webview rebinds by one store — no handler is ever rebuilt.
#[derive(Clone)]
struct Identity(Arc<Mutex<String>>);

impl Identity {
    fn new(process: &str) -> Identity {
        Identity(Arc::new(Mutex::new(process.to_string())))
    }
    fn process(&self) -> String {
        self.0.lock().expect("identity lock").clone()
    }
    fn rebind(&self, process: &str) {
        *self.0.lock().expect("identity lock") = process.to_string();
    }
}

/// An overlay webview between processes: hidden, its dead document blanked,
/// everything expensive — the WebContent process, the evaluated runtime, the
/// compositor — still warm (`recycle`).
struct Parked {
    identity: Identity,
    webview: wry::WebView,
    /// Whether this pane has ever been on screen. A prewarmed pane has not,
    /// and its first claim measures compositor spin-up honestly.
    shown: bool,
}

fn main() {
    // host.md §Boot sequence, step 1: the runtime comes first — the engine
    // runs on it, tao's event loop stays on the main thread.
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("tokio runtime");

    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.iter().any(|a| a == "--fixture") {
        fixture_main(runtime);
    } else {
        engine_main(runtime, &args);
    }
}

// ---- the real thing: webviews reading the seeded field through the engine ---

fn engine_main(runtime: tokio::runtime::Runtime, args: &[String]) {
    let cwd = std::env::current_dir().expect("cwd");
    let active = boot::resolve_active_path(args, &cwd);
    let timing = Arc::new(Timing::from_env());

    // Boot steps 2–10 inside the runtime context (Engine::open reads
    // Handle::try_current); the event loop below is step 11.
    let booted = {
        let _guard = runtime.enter();
        match boot::boot(&active) {
            Ok(booted) => booted,
            Err(e) => {
                eprintln!("host: boot failed\n{e}");
                std::process::exit(1);
            }
        }
    };
    let Booted { engine, mut host_rx, provider, session, tab, active_db, tiles, strip, programs_root } =
        booted;
    let engine_api: Arc<dyn EngineApi> = Arc::new(EngineAdapter::new(engine.clone()));

    // The program layer's own boot: one bun process behind `ol://`, and the
    // tree its modules may come from. A surface cannot render without it, so a
    // failure here is fatal rather than a window of stand-ins.
    let source_root = serve::source_root(&programs_root);
    let transpiler = match Transpiler::start(&serve::cache_dir()) {
        Ok(transpiler) => Arc::new(transpiler),
        Err(e) => {
            eprintln!("host: the module transpiler did not start ({e})\nis `bun` on PATH?");
            std::process::exit(1);
        }
    };

    // Warm the compile lane off the critical path (board directive, menu
    // latency): every seeded surface's stylesheet and module graph, so the
    // first overlay open finds a full cache instead of paying cold transpile
    // and Tailwind time under the click. `OL_NO_WARM=1` skips it — the
    // measurement lane's before/after switch.
    if std::env::var("OL_NO_WARM").map(|v| v != "1").unwrap_or(true) {
        let (transpiler, programs_root) = (transpiler.clone(), programs_root.clone());
        std::thread::spawn(move || serve::warm(&transpiler, &programs_root));
    }

    // The telemetry lane (settings chunk, `timings`): every finished open
    // path becomes event chunks on its process trace, typed by category
    // chunks (`telemetry` — the process *is* the trace; nothing aggregate is
    // stored). Stderr stays `OL_TIMING`'s, the measurement lane; the two are
    // the same marks.
    if settings_timings(&engine, &session) {
        let (sink_engine, handle) = (engine.clone(), runtime.handle().clone());
        timing.to_field(Box::new(move |execution| {
            let engine = sink_engine.clone();
            // Off the caller's thread — done() fires on wry's IPC callback.
            handle.spawn(async move {
                if let Err(e) = host::telemetry::commit_execution(&engine, &execution) {
                    eprintln!("host: {e}");
                }
            });
        }));
    }

    let strip_process = strip.process.clone();

    // The probe lane (board.md's layout-as-data jewel, thin end): boot whole,
    // then ask each surface what its DOM became. Nothing else changes.
    let probing = args.iter().any(|a| a == "--probe");

    let event_loop: EventLoop<RimEvent> = EventLoopBuilder::with_user_event().build();
    let window = WindowBuilder::new()
        .with_title("OpenLight")
        .with_inner_size(LogicalSize::new(1280.0, 840.0))
        // Light theme, forced: on macOS the window otherwise takes the system
        // appearance and paints itself dark, and the frame's chrome and the
        // webviews' `prefers-color-scheme` must agree.
        .with_theme(Some(Theme::Light))
        .build(&event_loop)
        .expect("window");
    paint_canvas(&window);

    // The HostCmd forwarding task: engine's Receiver → EventLoopProxy — the
    // engine side never holds a WebView; commands cross as data (engine.md).
    let forward_proxy = event_loop.create_proxy();
    runtime.spawn(async move {
        while let Some(cmd) = host_rx.recv().await {
            if forward_proxy.send_event(RimEvent::Engine(cmd)).is_err() {
                return; // event loop gone; shutdown owns the rest
            }
        }
    });

    // The reactivity seam: the active project's commit broadcast, coalesced,
    // filtered to commits that move placements — a body write (a status flip,
    // a streaming delta) never re-reads the tree. `HostCmd` carries no commit
    // events and the engine's `subscribe` requires a process context (its
    // recorded gap), so the rim drinks from the db feed it already holds.
    let feed_proxy = event_loop.create_proxy();
    runtime.spawn(async move {
        let feed = active_db.subscribe_scope(&[], db::SubscribeOpts { branch: db::BranchName::default() });
        tokio::pin!(feed);
        while let Some(commit) = feed.next().await {
            let mut relevant = !commit.placements_modified.is_empty();
            // Coalesce the burst: one relayout, not one per commit.
            while let Ok(Some(next)) = tokio::time::timeout(Duration::from_millis(15), feed.next()).await {
                relevant = relevant || !next.placements_modified.is_empty();
            }
            if relevant && feed_proxy.send_event(RimEvent::TreeChanged).is_err() {
                return;
            }
        }
    });

    // `--demo-open-in-tile`: drive the open-in-tile commit through the engine
    // once the window stands — the headless-friendly way to reach the two-tile
    // state for a screenshot (board directive). Ordinary ops, host context.
    if args.iter().any(|a| a == "--demo-open-in-tile") {
        let (engine, session, tab) = (engine.clone(), session.clone(), tab.clone());
        runtime.spawn(async move {
            tokio::time::sleep(Duration::from_millis(2500)).await;
            if let Err(e) = demo_open_in_tile(&engine, &session, &tab) {
                eprintln!("host: --demo-open-in-tile failed: {e}");
            }
        });
    }

    // `--demo-menu`: raise the context menu through the same run op the strip
    // posts — the open path under measurement (OL_TIMING=1), pointer-free.
    // Then the recycle lane's A/B: cancel it, open again — the second open
    // claims the parked pane, and the two traces sit side by side.
    if args.iter().any(|a| a == "--demo-menu") {
        let (engine, session) = (engine.clone(), session.clone());
        runtime.spawn(async move {
            tokio::time::sleep(Duration::from_millis(2500)).await;
            let first = match demo_menu(&engine, &session) {
                Ok(process) => process,
                Err(e) => {
                    eprintln!("host: --demo-menu failed: {e}");
                    return;
                }
            };
            tokio::time::sleep(Duration::from_millis(3000)).await;
            if let Err(e) = engine.cancel(&engine::Context::host(), &first) {
                eprintln!("host: --demo-menu cancel failed: {e}");
                return;
            }
            tokio::time::sleep(Duration::from_millis(1500)).await;
            if let Err(e) = demo_menu(&engine, &session) {
                eprintln!("host: --demo-menu reopen failed: {e}");
            }
        });
    }

    // The prewarm lane (`recycle`): every program the settings chunk names
    // gets a warm pane before its first launch, built off the boot path once
    // the window has settled. One shot — after the first claim, recycling
    // refills the slot through use. `OL_NO_PREWARM=1` skips it, the
    // measurement lane's before/after switch beside `OL_NO_WARM`.
    if std::env::var("OL_NO_PREWARM").map(|v| v != "1").unwrap_or(true) {
        let (engine, session, prewarm_proxy) =
            (engine.clone(), session.clone(), event_loop.create_proxy());
        runtime.spawn(async move {
            tokio::time::sleep(Duration::from_millis(2000)).await;
            for executable in prewarm_targets(&engine, &session) {
                let _ = prewarm_proxy.send_event(RimEvent::Prewarm { executable });
            }
        });
    }

    let mut views: HashMap<ViewKey, View> = HashMap::new();
    // Warm overlay panes between processes (`recycle`): parked on unmount,
    // claimed by the next mount of the same executable.
    let mut pool: Pool<Parked> = Pool::new();
    let mut terminals: HashMap<ProcessId, tokio::sync::oneshot::Sender<TerminalReason>> =
        HashMap::new();
    // Mounts whose leaf has not landed yet: `run` and the tree commit are two
    // ops, and `MountWebview` may outrun the commit. The pending parks here
    // and completes on the `TreeChanged` that brings its leaf.
    let mut parked: HashMap<ProcessId, PendingWebview> = HashMap::new();
    // The current tab's tree, re-read on TreeChanged; the layout truth between.
    let mut view_state: TreeView = match tree::read(&engine, &tab) {
        Ok(view) => view,
        Err(e) => {
            eprintln!("host: {e}");
            TreeView::empty()
        }
    };
    let proxy = event_loop.create_proxy();

    // Every boot surface owes exactly one probe report. The deadline is the
    // lane's honesty: a probe that never completes must fail, not hang.
    let tally = Arc::new(Mutex::new(probe::Tally::new(tiles.len() + 1)));
    if probing {
        let tally = tally.clone();
        runtime.spawn(async move {
            tokio::time::sleep(PROBE_DEADLINE).await;
            eprintln!("host: probe deadline — {} surfaces answered", tally.lock().expect("tally").seen());
            std::process::exit(2);
        });
    }

    event_loop.run(move |event, _, control_flow| {
        // Moved in so the runtime outlives the loop that feeds it — a
        // `Handle` alone does not keep its workers alive.
        let _runtime = &runtime;
        *control_flow = ControlFlow::Wait;
        match event {
            Event::WindowEvent { event: WindowEvent::CloseRequested, .. } => {
                shutdown(&runtime, &engine, &mut views, &mut pool, &mut terminals, control_flow);
            }
            Event::WindowEvent { event: WindowEvent::Resized(_), .. } => {
                place_all(&window, &view_state, &views);
            }
            Event::UserEvent(RimEvent::TreeChanged) => {
                match tree::read(&engine, &tab) {
                    Ok(next) => view_state = next,
                    Err(e) => {
                        eprintln!("host: {e}");
                        return; // keep the last good tree; never tear the window
                    }
                }
                reconcile(Reconcile {
                    window: &window,
                    view_state: &view_state,
                    views: &mut views,
                    terminals: &mut terminals,
                    parked: &mut parked,
                    engine_api: &engine_api,
                    runtime: &runtime,
                    proxy: &proxy,
                    transpiler: &transpiler,
                    source_root: &source_root,
                    programs_root: &programs_root,
                    session: &session,
                    timing: &timing,
                    probing,
                    tally: &tally,
                });
                place_all(&window, &view_state, &views);
            }
            Event::UserEvent(RimEvent::Engine(HostCmd::MountWebview { process_id, executable })) => {
                timing.mark(process_id.as_str(), "mount-command");
                let Some(pending) = provider.take_pending(&process_id) else {
                    return; // unknown or already claimed; nothing to mount
                };
                // Where the webview goes is the program's own declaration, read
                // off the field: an overlay takes the window, everything else
                // takes the rectangle geometry gives it (host.md §Overlays).
                let (declared_name, surface) = boot::program_kind(&engine, &pending.program);
                let (strip_rect, leaves) = layout(&window, &view_state, STRIP);
                let (key, rect) = match surface {
                    Surface::Overlay => {
                        if let Some(warm) = pool.claim(&executable) {
                            remount_overlay(
                                warm,
                                window_rect(&window),
                                process_id,
                                declared_name.unwrap_or_else(|| executable.clone()),
                                executable,
                                Some(pending),
                                &mut views,
                                &mut terminals,
                                &runtime,
                                &proxy,
                                &timing,
                            );
                            return;
                        }
                        (ViewKey::Overlay(process_id.clone()), window_rect(&window))
                    }
                    Surface::Tile if process_id == strip_process => (ViewKey::Strip, strip_rect),
                    Surface::Tile => {
                        let leaf = view_state
                            .leaf_of(&process_id)
                            .and_then(|l| leaves.iter().find(|r| r.id == l.tile));
                        match leaf {
                            Some(leaf) => (ViewKey::Tile(leaf.id.clone()), leaf.rect.clone()),
                            None => {
                                // No leaf yet: the tree commit is still in
                                // flight. Park; TreeChanged completes it. Said
                                // aloud because a park nothing completes is a
                                // surface that silently never appears — the
                                // stale-leaf boot bug was found by this line.
                                eprintln!("host: mount for {process_id} parked — no leaf relates it yet");
                                parked.insert(process_id, pending);
                                return;
                            }
                        }
                    }
                };
                let program = declared_name.unwrap_or_else(|| pending.executable.clone());
                mount(Mount {
                    window: &window,
                    key,
                    process: process_id,
                    program,
                    executable: &executable,
                    rect,
                    pending: Some(pending),
                    views: &mut views,
                    terminals: &mut terminals,
                    engine_api: &engine_api,
                    runtime: &runtime,
                    proxy: &proxy,
                    transpiler: &transpiler,
                    source_root: &source_root,
                    programs_root: &programs_root,
                    session: &session,
                    timing: &timing,
                    probing,
                    tally: &tally,
                });
            }
            Event::UserEvent(RimEvent::Engine(HostCmd::UnmountWebview { process_id })) => {
                // The probe lane's one seam into the loop: no process is named
                // this, so the ordinary unmount stays what it was.
                if process_id.as_str() == probe::DONE {
                    shutdown(&runtime, &engine, &mut views, &mut pool, &mut terminals, control_flow);
                    return;
                }
                let dead: Vec<ViewKey> = views
                    .iter()
                    .filter(|(_, view)| view.process == process_id)
                    .map(|(key, _)| key.clone())
                    .collect();
                for key in dead {
                    let Some(view) = views.remove(&key) else { continue };
                    // A served overlay parks instead of dying (`recycle`) —
                    // hidden, and its dead document blanked now, so the next
                    // claim can show the pane before its navigation paints
                    // without flashing what the last process left.
                    if matches!(key, ViewKey::Overlay(_)) && view.served {
                        let View { executable, identity, webview, .. } = view;
                        let _ = webview.set_visible(false);
                        let _ = webview.evaluate_script("document.body.replaceChildren()");
                        drop(pool.park(&executable, Parked { identity, webview, shown: true }));
                    }
                }
                terminals.remove(&process_id);
                parked.remove(&process_id);
            }
            Event::UserEvent(RimEvent::Engine(HostCmd::EvaluateScript { process_id, script })) => {
                // Engine-origin scripts fan out: every view of the process gets
                // the event; each SDK instance keeps only its own subscriptions.
                for view in views.values().filter(|v| v.process == process_id) {
                    let _ = view.webview.evaluate_script(&script);
                }
            }
            Event::UserEvent(RimEvent::Reply { view, script }) => {
                if let Some(view) = views.get(&view) {
                    // The surface's first answered op — the stretch between
                    // this and first-ipc is the engine round trip.
                    timing.mark_once(view.process.as_str(), "first-reply");
                    let _ = view.webview.evaluate_script(&script);
                }
            }
            Event::UserEvent(RimEvent::Prewarm { executable }) => {
                // An occupied slot means a pane already waits — never two.
                if pool.occupied(&executable) {
                    return;
                }
                let entry = programs_root.join(&executable);
                if !entry.is_file() {
                    return;
                }
                // The pane speaks as nobody (empty identity) until a claim
                // rebinds it; its page is the warm route — the program's
                // packages evaluated, its own code fetched but never run
                // (`serve::warm_page`, the author's ruling).
                let identity = Identity::new("");
                let init = page_init("", 0.0, 0.0, &timing);
                let builder = WebViewBuilder::new()
                    .with_bounds(bounds(&window_rect(&window)))
                    .with_transparent(true)
                    .with_initialization_script(&init)
                    .with_ipc_handler(ipc_handler(
                        engine_api.clone(),
                        runtime.handle().clone(),
                        proxy.clone(),
                        identity.clone(),
                        None,
                        None,
                        timing.clone(),
                    ))
                    .with_custom_protocol(
                        serve::SCHEME.into(),
                        module_protocol(
                            transpiler.clone(),
                            source_root.clone(),
                            identity.clone(),
                            entry,
                            timing.clone(),
                        ),
                    )
                    .with_url(serve::warm_url());
                let Ok(webview) = builder.build_as_child(&window) else {
                    return; // no pane, no economy — the cold path still works
                };
                let _ = webview.set_visible(false);
                if timing.enabled() {
                    eprintln!("host: prewarmed a pane for {executable}");
                }
                drop(pool.park(&executable, Parked { identity, webview, shown: false }));
            }
            _ => {}
        }
    });
}

/// Whether the settings chunk turns the telemetry lane on.
fn settings_timings(engine: &engine::Engine, session: &ChunkId) -> bool {
    let opts = db::ReadOpts {
        include: db::Includes { chunk_body: true, ..db::Includes::default() },
        ..db::ReadOpts::default()
    };
    matches!(
        engine.get(&engine::Context::host(), &seed::settings_id(session), opts),
        Ok(Some(item))
            if item.body.as_ref().and_then(|b| b.get(seed::TIMINGS_KEY)).and_then(|v| v.as_bool())
                == Some(true)
    )
}

/// What the field says to prewarm: the settings chunk's `prewarm` names
/// resolved to overlay programs' executables. Absent settings, unknown names,
/// non-overlay surfaces — all skipped silently: prewarming is an economy,
/// never a correctness requirement. (Only overlays claim from the pool today;
/// tiles keep their per-leaf lifecycle.)
fn prewarm_targets(engine: &engine::Engine, session: &ChunkId) -> Vec<String> {
    let ctx = engine::Context::host();
    let opts = db::ReadOpts {
        include: db::Includes { chunk_body: true, ..db::Includes::default() },
        ..db::ReadOpts::default()
    };
    let Ok(Some(settings)) = engine.get(&ctx, &seed::settings_id(session), opts.clone()) else {
        return Vec::new();
    };
    let names: Vec<String> = settings
        .body
        .and_then(|body| body.get(seed::PREWARM_KEY).cloned())
        .and_then(|list| serde_json::from_value(list).ok())
        .unwrap_or_default();
    names
        .iter()
        .filter_map(|name| {
            let program = engine.resolve_name(&ctx, name).ok()?;
            let (_, surface) = boot::program_kind(engine, &program);
            if !matches!(surface, Surface::Overlay) {
                return None;
            }
            let item = engine.get(&ctx, &program, opts.clone()).ok()??;
            item.body?.get("executable")?.as_str().map(str::to_string)
        })
        .collect()
}

/// The open-in-tile state, driven through ordinary ops (board directive): a
/// second read-tile run, then the commit the sidebar's menu would make — the
/// root becomes a horizontal split of the existing tree and a new leaf
/// relating the fresh process.
fn demo_open_in_tile(
    engine: &engine::Engine,
    session: &ChunkId,
    tab: &ChunkId,
) -> Result<(), String> {
    let ctx = engine::Context::host();
    let program = engine
        .resolve_name(&ctx, "host/read-tile")
        .map_err(|e| format!("resolving host/read-tile: {e}"))?;
    let process = engine
        .run(
            &ctx,
            engine::RunArgs {
                program_id: program,
                chunks: vec![db::ChunkDeclaration {
                    id: None,
                    name: Some("request".into()),
                    spec: None,
                    body: Some(serde_json::json!({ "target": [session.as_str()] })),
                    removed: false,
                }],
                placements: vec![session.clone()],
                mode: engine::RunMode::Launch,
                read_boundary: engine::BoundarySpec::Roots(vec![session.clone()]),
                write_boundary: engine::BoundarySpec::Roots(vec![session.clone()]),
                timeout_ms: None,
            },
        )
        .map_err(|e| format!("running host/read-tile: {e}"))?;

    let current = tree::read(engine, tab).map_err(|e| e.to_string())?;
    let root = match &current.tree {
        Some(Tile::Leaf { id }) | Some(Tile::Split { id, .. }) => id.clone(),
        None => return Err("the demo needs a rooted tab".into()),
    };
    let tile_archetype = engine
        .resolve_name(&ctx, "host/tile")
        .map_err(|e| format!("resolving host/tile: {e}"))?;
    let split = "tile-split-demo";
    let leaf = "tile-second";
    // A previous demo already split this tab: the leaf exists in the tree, so
    // only its relates edge moves — the same re-pointing boot does for the
    // first leaf. Idempotence over a persistent field.
    if current.leaves.contains_key(leaf) {
        return seed::point_leaf(engine, &ChunkId::from(leaf), &process);
    }
    let instance = |chunk: &str, scope: &str, seq: Option<i64>, active: bool| db::PlacementSpec {
        chunk: ChunkId::from(chunk),
        scope: ChunkId::from(scope),
        type_: db::PlacementType::Instance,
        seq,
        active,
    };
    // Two commits, mirroring the sidebar's shape exactly (items.ts): stage
    // creates and types the tiles, graft wires them — a bounded identity
    // cannot place onto a tile born in the same declaration, and the demo
    // must walk the same path the menu does.
    engine
        .commit(
            &ctx,
            db::Declaration {
                chunks: vec![
                    db::ChunkDeclaration {
                        id: Some(ChunkId::from(split)),
                        body: Some(serde_json::json!({ "direction": "horizontal", "ratio": 0.5 })),
                        ..db::ChunkDeclaration::default()
                    },
                    db::ChunkDeclaration {
                        id: Some(ChunkId::from(leaf)),
                        body: Some(serde_json::json!({})),
                        ..db::ChunkDeclaration::default()
                    },
                ],
                placements: vec![
                    instance(split, tile_archetype.as_str(), None, true),
                    instance(leaf, tile_archetype.as_str(), None, true),
                ],
                message: Some("open in tile (demo): stage".into()),
            },
        )
        .map_err(|e| format!("the stage commit: {e}"))?;
    engine
        .commit(
            &ctx,
            db::Declaration {
                chunks: vec![],
                placements: vec![
                    instance(split, tab.as_str(), Some(1), true),
                    instance(&root, tab.as_str(), None, false),
                    instance(&root, split, Some(1), true),
                    instance(leaf, split, Some(2), true),
                    db::PlacementSpec {
                        chunk: ChunkId::from(leaf),
                        scope: process.clone(),
                        type_: db::PlacementType::Relates,
                        seq: None,
                        active: true,
                    },
                ],
                message: Some("open in tile (demo): graft".into()),
            },
        )
        .map_err(|e| format!("the graft commit: {e}"))?;
    Ok(())
}

/// One context-menu run, shaped exactly as the strip's click posts it.
fn demo_menu(engine: &engine::Engine, session: &ChunkId) -> Result<ProcessId, String> {
    let ctx = engine::Context::host();
    let program = engine
        .resolve_name(&ctx, "host/context-menu")
        .map_err(|e| format!("resolving host/context-menu: {e}"))?;
    engine
        .run(
            &ctx,
            engine::RunArgs {
                program_id: program,
                chunks: vec![db::ChunkDeclaration {
                    id: None,
                    name: Some("request".into()),
                    spec: None,
                    body: Some(serde_json::json!({
                        "head": "read-tile",
                        "anchor": { "x": 280, "y": 140 },
                        "entries": [
                            { "label": "Terminate", "op": { "kind": "none" }, "disabled": true },
                            { "label": "Hide", "op": { "kind": "none" }, "disabled": true },
                        ],
                    })),
                    removed: false,
                }],
                placements: vec![session.clone()],
                mode: engine::RunMode::Launch,
                read_boundary: engine::BoundarySpec::Roots(vec![session.clone()]),
                write_boundary: engine::BoundarySpec::Roots(vec![session.clone()]),
                timeout_ms: None,
            },
        )
        .map_err(|e| format!("running host/context-menu: {e}"))
}

/// What one mount needs — the rim's one webview constructor, shared by the
/// engine-commanded path (with pending handles) and the viewer path (a leaf
/// pointed at a process that already holds a surface elsewhere; no handles —
/// the process's engine transport was claimed by its first mount, so this view
/// speaks as the process over IPC and receives the same fanned-out events).
struct Mount<'a> {
    window: &'a Window,
    key: ViewKey,
    process: ProcessId,
    program: String,
    executable: &'a str,
    rect: Rect,
    pending: Option<PendingWebview>,
    views: &'a mut HashMap<ViewKey, View>,
    terminals: &'a mut HashMap<ProcessId, tokio::sync::oneshot::Sender<TerminalReason>>,
    engine_api: &'a Arc<dyn EngineApi>,
    runtime: &'a tokio::runtime::Runtime,
    proxy: &'a EventLoopProxy<RimEvent>,
    transpiler: &'a Arc<Transpiler>,
    source_root: &'a std::path::PathBuf,
    programs_root: &'a std::path::PathBuf,
    session: &'a ChunkId,
    timing: &'a Arc<Timing>,
    probing: bool,
    tally: &'a Arc<Mutex<probe::Tally>>,
}

/// A page's initialization script: the transport alias and identity stamp
/// (`page`), plus the paint probes when timing is on. Init scripts run on
/// every document a webview loads, so a recycled pane re-arms its probes with
/// each navigation.
fn page_init(process: &str, x: f64, y: f64, timing: &Timing) -> String {
    let mut init = page::init_script(process, x, y);
    if timing.enabled() {
        // Paint proxies, posted through the IPC channel and read before
        // dispatch: `__frame` is the page's first rendered frame — compositor
        // spin-up, since this is scheduled at document start — and `__paint`
        // the frame after it.
        init.push_str(
            "\nrequestAnimationFrame(() => { window.ipc.postMessage('\"__frame\"'); requestAnimationFrame(() => window.ipc.postMessage('\"__paint\"')); });",
        );
    }
    init
}

fn mount(m: Mount) {
    let Mount {
        window,
        key,
        process,
        program,
        executable,
        rect,
        pending,
        views,
        terminals,
        engine_api,
        runtime,
        proxy,
        transpiler,
        source_root,
        programs_root,
        session,
        timing,
        probing,
        tally,
    } = m;
    let init = page_init(process.as_str(), rect.x, rect.y, timing);
    let identity = Identity::new(process.as_str());
    let builder = WebViewBuilder::new()
        .with_bounds(bounds(&rect))
        .with_transparent(true)
        .with_initialization_script(&init)
        .with_ipc_handler(ipc_handler(
            engine_api.clone(),
            runtime.handle().clone(),
            proxy.clone(),
            identity.clone(),
            // An overlay's view key follows its identity (the pane recycles
            // across processes); everywhere else the key is the mount's own.
            match &key {
                ViewKey::Overlay(_) => None,
                fixed => Some(fixed.clone()),
            },
            probing.then(|| ProbeSink {
                program: program.clone(),
                tally: tally.clone(),
                proxy: proxy.clone(),
            }),
            timing.clone(),
        ));
    // A program whose entry exists on disk is served over `ol://`; the rest
    // keep the rim's demo HTML until theirs is written (host.md §Authoring
    // Programs).
    let entry = programs_root.join(executable);
    let served = entry.is_file();
    let builder = if served {
        builder
            .with_custom_protocol(
                serve::SCHEME.into(),
                module_protocol(
                    transpiler.clone(),
                    source_root.clone(),
                    identity.clone(),
                    entry,
                    timing.clone(),
                ),
            )
            .with_url(serve::shell_url(process.as_str()))
    } else {
        builder.with_html(demo_page(&program, process.as_str(), session.as_str(), false))
    };
    let webview = builder.build_as_child(window).expect("webview");
    timing.mark(process.as_str(), "webview-built");
    timing.label(process.as_str(), &program);
    // Only a tile floats: the strip is naked on the canvas, and an overlay is a
    // transparent pane whose own panel casts its shadow in CSS — the aura
    // belongs to what the *window* frames.
    match &key {
        ViewKey::Overlay(_) => {
            // The pane is the whole window and takes every click; it must take
            // the keys too, or Escape never reaches it.
            let _ = webview.focus();
        }
        ViewKey::Tile(_) => cast_aura(&webview, &rect),
        ViewKey::Strip => {}
    }
    views.insert(
        key,
        View { process: process.clone(), executable: executable.to_string(), served, identity, webview },
    );

    if probing {
        // Through the ordinary delivery path, once the surface has had time to
        // read its scope and render.
        let (pid, probe_proxy) = (process.clone(), proxy.clone());
        runtime.spawn(async move {
            tokio::time::sleep(PROBE_SETTLE).await;
            let script = probe::script(probe::HTML_LIMIT, probe::NODE_LIMIT);
            let _ = probe_proxy
                .send_event(RimEvent::Engine(HostCmd::EvaluateScript { process_id: pid, script }));
        });
    }

    let Some(pending) = pending else { return };
    adopt(pending, process, terminals, runtime, proxy);
}

/// Wire a spawn's engine handles to the view now standing: readiness fires,
/// the terminal channel parks, and outgoing engine traffic (subscription
/// events) becomes delivery scripts; a closed channel is the engine's kill
/// signal — unmount follows. Shared by first mounts and recycled ones.
fn adopt(
    pending: PendingWebview,
    process: ProcessId,
    terminals: &mut HashMap<ProcessId, tokio::sync::oneshot::Sender<TerminalReason>>,
    runtime: &tokio::runtime::Runtime,
    proxy: &EventLoopProxy<RimEvent>,
) {
    let _ = pending.ready.send(());
    terminals.insert(process.clone(), pending.terminal);
    let mut events = pending.events;
    let drain_proxy = proxy.clone();
    runtime.spawn(async move {
        while let Some(payload) = events.recv().await {
            let script = protocol::delivery_script(&payload);
            let cmd = RimEvent::Engine(HostCmd::EvaluateScript {
                process_id: process.clone(),
                script,
            });
            if drain_proxy.send_event(cmd).is_err() {
                return;
            }
        }
        let _ = drain_proxy.send_event(RimEvent::Engine(HostCmd::UnmountWebview { process_id: process }));
    });
}

/// Claim a parked pane for a new overlay process (`recycle`): rebind its
/// identity, renavigate to the new process's shell, show. The webview, its
/// WebContent process, its evaluated runtime, its compositor — all warm; this
/// open pays a document, never a webview. Order matters: the pane becomes
/// visible only after the navigation is underway, and the old document was
/// blanked at park, so nothing stale can flash.
#[allow(clippy::too_many_arguments)]
fn remount_overlay(
    warm: Parked,
    rect: Rect,
    process: ProcessId,
    program: String,
    executable: String,
    pending: Option<PendingWebview>,
    views: &mut HashMap<ViewKey, View>,
    terminals: &mut HashMap<ProcessId, tokio::sync::oneshot::Sender<TerminalReason>>,
    runtime: &tokio::runtime::Runtime,
    proxy: &EventLoopProxy<RimEvent>,
    timing: &Arc<Timing>,
) {
    let Parked { identity, webview, shown } = warm;
    identity.rebind(process.as_str());
    timing.mark(process.as_str(), if shown { "webview-recycled" } else { "webview-prewarmed" });
    timing.label(process.as_str(), &program);
    let _ = webview.set_bounds(bounds(&rect));
    let _ = webview.load_url(&serve::shell_url(process.as_str()));
    let _ = webview.set_visible(true);
    // The pane is the whole window and takes every click; it must take the
    // keys too, or Escape never reaches it (as at first mount).
    let _ = webview.focus();
    views.insert(
        ViewKey::Overlay(process.clone()),
        View { process: process.clone(), executable, served: true, identity, webview },
    );
    if let Some(pending) = pending {
        adopt(pending, process, terminals, runtime, proxy);
    }
}

/// Reconcile the mounted views with the tree just read: drop views whose leaf
/// left the tree (the process lives on — closing a tile never kills; host.md
/// §Lifecycle), complete parked mounts whose leaf arrived, and open viewer
/// webviews for leaves pointing at processes already surfaced elsewhere.
struct Reconcile<'a> {
    window: &'a Window,
    view_state: &'a TreeView,
    views: &'a mut HashMap<ViewKey, View>,
    terminals: &'a mut HashMap<ProcessId, tokio::sync::oneshot::Sender<TerminalReason>>,
    parked: &'a mut HashMap<ProcessId, PendingWebview>,
    engine_api: &'a Arc<dyn EngineApi>,
    runtime: &'a tokio::runtime::Runtime,
    proxy: &'a EventLoopProxy<RimEvent>,
    transpiler: &'a Arc<Transpiler>,
    source_root: &'a std::path::PathBuf,
    programs_root: &'a std::path::PathBuf,
    session: &'a ChunkId,
    timing: &'a Arc<Timing>,
    probing: bool,
    tally: &'a Arc<Mutex<probe::Tally>>,
}

fn reconcile(r: Reconcile) {
    let (_, leaves) = layout(r.window, r.view_state, STRIP);

    // Views whose leaf is gone, or whose leaf now displays another process.
    r.views.retain(|key, view| match key {
        ViewKey::Tile(tile) => r
            .view_state
            .leaves
            .get(tile)
            .map(|leaf| leaf.process.as_ref() == Some(&view.process))
            .unwrap_or(false),
        _ => true,
    });

    for leaf_rect in &leaves {
        let key = ViewKey::Tile(leaf_rect.id.clone());
        if r.views.contains_key(&key) {
            continue;
        }
        let Some(leaf) = r.view_state.leaves.get(&leaf_rect.id) else { continue };
        let Some(process) = leaf.process.clone() else { continue };
        let pending = r.parked.remove(&process);
        if pending.is_none() {
            // Viewer path: only for a run that is still alive and has a served
            // entry — a terminal process's rectangle stays empty (its autopsy
            // is the inspector's, unbuilt).
            let live = matches!(leaf.status.as_deref(), Some("running") | Some("pending"));
            if !live || leaf.executable.is_none() {
                continue;
            }
        }
        let program =
            leaf.program_name.clone().unwrap_or_else(|| leaf.executable.clone().unwrap_or_default());
        let executable = leaf.executable.clone().unwrap_or_default();
        mount(Mount {
            window: r.window,
            key,
            process,
            program,
            executable: &executable,
            rect: leaf_rect.rect.clone(),
            pending,
            views: r.views,
            terminals: r.terminals,
            engine_api: r.engine_api,
            runtime: r.runtime,
            proxy: r.proxy,
            transpiler: r.transpiler,
            source_root: r.source_root,
            programs_root: r.programs_root,
            session: r.session,
            timing: r.timing,
            probing: r.probing,
            tally: r.tally,
        });
    }
}

/// Put every view where the current tree says it belongs. Strip and tiles move
/// together — the tiling area is defined as what the strip leaves, so one walk
/// keeps both coherent; an overlay spans the window, whatever it becomes.
fn place_all(window: &Window, view_state: &TreeView, views: &HashMap<ViewKey, View>) {
    let (strip_rect, leaves) = layout(window, view_state, STRIP);
    let whole = window_rect(window);
    for (key, view) in views {
        match key {
            ViewKey::Strip => place(&view.webview, &strip_rect),
            ViewKey::Overlay(_) => place(&view.webview, &whole),
            ViewKey::Tile(tile) => {
                if let Some(leaf) = leaves.iter().find(|l| l.id == *tile) {
                    place(&view.webview, &leaf.rect);
                    // The aura is cut to the tile, so it is re-cut with it.
                    cast_aura(&view.webview, &leaf.rect);
                }
            }
        }
    }
}

// ---- the hollow host, kept runnable for comparison: `--fixture` -------------

fn fixture_main(runtime: tokio::runtime::Runtime) {
    let (chunks, placements) = field::demo();
    let stub: Arc<dyn EngineApi> = Arc::new(FixtureStub::new(chunks.clone(), placements.clone()));
    let timing = Arc::new(Timing::from_env());

    let (tiles, tree_placements) =
        compose::tile_inputs(&chunks, &placements, field::HOST_TILE).expect("demo tile bodies");
    let tree = geometry::parse(field::DEMO_TAB, &tiles, &tree_placements).expect("demo tile tree");

    let event_loop: EventLoop<RimEvent> = EventLoopBuilder::with_user_event().build();
    let window = WindowBuilder::new()
        .with_title("OpenLight — hollow host (fixture)")
        .with_inner_size(LogicalSize::new(1280.0, 840.0))
        .with_theme(Some(Theme::Light))
        .build(&event_loop)
        .expect("window");
    paint_canvas(&window);

    // Views are keyed by leaf; the IPC context still names the process, the
    // identity the engine addresses (host.md §Transport).
    let mut webviews: HashMap<String, wry::WebView> = HashMap::new();
    let mut leaf_process: HashMap<String, ProcessId> = HashMap::new();
    // The fixture rim keeps its three-tile demo: no strip, so no reservation.
    let (_, leaves) = geometry_layout(&window, &tree, Strip { width: 0.0, bleed: Bleed::NONE });
    for leaf in leaves {
        let info = compose::leaf_process(
            &chunks,
            &placements,
            &leaf.id,
            field::ENGINE_PROCESS,
            field::ENGINE_PROGRAM,
        )
        .expect("every demo leaf displays a process");
        let html = fixture_page(&info);
        let webview = WebViewBuilder::new()
            .with_bounds(bounds(&leaf.rect))
            .with_transparent(true)
            .with_initialization_script(&page::init_script(&info.process, leaf.rect.x, leaf.rect.y))
            .with_html(html)
            .with_ipc_handler(ipc_handler(
                stub.clone(),
                runtime.handle().clone(),
                event_loop.create_proxy(),
                Identity::new(&info.process),
                Some(ViewKey::Tile(leaf.id.clone())),
                None,
                timing.clone(),
            ))
            .build_as_child(&window)
            .expect("webview");
        leaf_process.insert(leaf.id.clone(), ChunkId::from(info.process.as_str()));
        webviews.insert(leaf.id, webview);
    }

    event_loop.run(move |event, _, control_flow| {
        let _runtime = &runtime;
        *control_flow = ControlFlow::Wait;
        match event {
            Event::WindowEvent { event: WindowEvent::CloseRequested, .. } => {
                *control_flow = ControlFlow::Exit;
            }
            Event::WindowEvent { event: WindowEvent::Resized(_), .. } => {
                let (_, leaves) =
                    geometry_layout(&window, &tree, Strip { width: 0.0, bleed: Bleed::NONE });
                for leaf in leaves {
                    if let Some(webview) = webviews.get(&leaf.id) {
                        let _ = webview.set_bounds(bounds(&leaf.rect));
                    }
                }
            }
            Event::UserEvent(RimEvent::Engine(HostCmd::EvaluateScript { process_id, script })) => {
                for (leaf, webview) in &webviews {
                    if leaf_process.get(leaf) == Some(&process_id) {
                        let _ = webview.evaluate_script(&script);
                    }
                }
            }
            Event::UserEvent(RimEvent::Reply { view: ViewKey::Tile(leaf), script }) => {
                if let Some(webview) = webviews.get(&leaf) {
                    let _ = webview.evaluate_script(&script);
                }
            }
            _ => {}
        }
    });
}

fn fixture_page(info: &ProcessInfo) -> String {
    demo_page(&info.program, &info.process, field::DEMO_SESSION, true)
}

// ---- shared wiring -----------------------------------------------------------

/// Shutdown reverses boot (host.md): drop the surfaces, then await the
/// engine's async shutdown, then exit. Reached from the window's close button
/// and from the probe lane's completion alike.
fn shutdown(
    runtime: &tokio::runtime::Runtime,
    engine: &engine::Engine,
    views: &mut HashMap<ViewKey, View>,
    pool: &mut Pool<Parked>,
    terminals: &mut HashMap<ProcessId, tokio::sync::oneshot::Sender<TerminalReason>>,
    control_flow: &mut ControlFlow,
) {
    views.clear();
    pool.clear();
    terminals.clear();
    if let Err(e) = runtime.block_on(engine.clone().shutdown()) {
        eprintln!("host: engine shutdown: {e}");
    }
    *control_flow = ControlFlow::Exit;
}

/// What one webview's probe answer needs: whose DOM it is, and the shared
/// count that says when the run is done.
#[derive(Clone)]
struct ProbeSink {
    program: String,
    tally: Arc<Mutex<probe::Tally>>,
    proxy: EventLoopProxy<RimEvent>,
}

/// host.md §Transport: per-webview `set_ipc_handler`; each message is parsed,
/// gets the webview's `Context { process_id }` attached, dispatches to the
/// engine seam, and resolves via `__sdk.resolve` on the main loop. Parsing is
/// all that happens on wry's callback thread — the engine call goes to the
/// runtime, because `await` suspends until the awaited processes end. The
/// reply targets this view alone; several views may speak as one process.
///
/// The process is read per message from the webview's [`Identity`], never
/// captured — a recycled pane speaks as whatever it was last bound to. `view`
/// is the mount's fixed key, or `None` for an overlay, whose key follows its
/// identity for the same reason.
fn ipc_handler(
    engine: Arc<dyn EngineApi>,
    runtime: tokio::runtime::Handle,
    proxy: EventLoopProxy<RimEvent>,
    identity: Identity,
    view: Option<ViewKey>,
    probe_sink: Option<ProbeSink>,
    timing: Arc<Timing>,
) -> impl Fn(wry::http::Request<String>) + 'static {
    move |message| {
        let process = identity.process();
        if process.is_empty() {
            return; // a warm pane speaks as nobody; nothing it says is traffic
        }
        let view = view
            .clone()
            .unwrap_or_else(|| ViewKey::Overlay(ChunkId::from(process.as_str())));
        let ctx = Context { process_id: Some(process.clone()) };
        if timing.enabled() {
            match message.body().as_str() {
                "\"__frame\"" => {
                    timing.mark(&process, "first-frame");
                    return;
                }
                "\"__paint\"" => {
                    timing.mark(&process, "first-paint");
                    timing.done(&process);
                    return;
                }
                _ => timing.mark_once(&process, "first-ipc"),
            }
        }
        // The probe answer rides the same channel, read before dispatch and
        // recognized by its envelope alone — ordinary traffic never matches.
        if let Some(sink) = &probe_sink {
            if let Some(report) = probe::parse(message.body()) {
                println!("{}", probe::line(&process, &sink.program, &report));
                if sink.tally.lock().expect("tally").record() {
                    let _ = sink.proxy.send_event(RimEvent::Engine(HostCmd::UnmountWebview {
                        process_id: ChunkId::from(probe::DONE),
                    }));
                }
                return;
            }
        }
        match dispatch::parse(message.body()) {
            Parsed::Execute(request) => {
                let run_op = matches!(request.op, protocol::Op::Run { .. });
                let (engine, ctx, proxy, view, timing) =
                    (engine.clone(), ctx.clone(), proxy.clone(), view.clone(), timing.clone());
                runtime.spawn(async move {
                    let dispatched = std::time::Instant::now();
                    let outcome = dispatch::execute(engine.as_ref(), &ctx, &request).await;
                    // The open path's first stage: the run op answered with the
                    // new process's id — everything after is keyed by it. The
                    // click itself is one IPC hop before this, sub-millisecond.
                    if run_op && timing.enabled() {
                        if let Outcome::Reply { response, .. } = &outcome {
                            if let Some(pid) = spawned_process(response) {
                                timing.mark(&pid, "run-returned");
                                eprintln!(
                                    "timing[{pid}] run op execution: {:.1}ms",
                                    dispatched.elapsed().as_secs_f64() * 1000.0
                                );
                            }
                        }
                    }
                    deliver(&proxy, view, outcome);
                });
            }
            Parsed::Settled(outcome) => deliver(&proxy, view.clone(), outcome),
        }
    }
}

/// The process a `run` reply names, if it names one.
fn spawned_process(response: &str) -> Option<String> {
    let value: serde_json::Value = serde_json::from_str(response).ok()?;
    Some(value.get("result")?.get("process")?.as_str()?.to_string())
}

/// One webview's `ol://` handler (`serve`). It is bound to that webview's own
/// process and entry, so a page can only ever ask for its own shell; modules
/// are shared, and so is the transpiler behind them.
///
/// The handler answers on the thread wry calls it from — the event loop's.
/// A cold module costs one round trip to bun; every later load is a file read
/// from the cache.
fn module_protocol(
    transpiler: Arc<Transpiler>,
    root: std::path::PathBuf,
    identity: Identity,
    entry: std::path::PathBuf,
    timing: Arc<Timing>,
) -> impl Fn(wry::WebViewId, wry::http::Request<Vec<u8>>) -> wry::http::Response<Cow<'static, [u8]>>
{
    move |_id, request| {
        let process = identity.process();
        let path = request.uri().path().to_string();
        if timing.enabled() && !process.is_empty() {
            match serve::route(&path) {
                serve::Route::Shell(_) => timing.mark(&process, "shell-served"),
                serve::Route::Styles(_) => timing.mark(&process, "styles-served"),
                serve::Route::Module(_) => timing.mark_once(&process, "first-module"),
                _ => {}
            }
        }
        let served = serve::serve(&transpiler, &root, &process, &entry, &path);
        wry::http::Response::builder()
            .status(served.status)
            .header(wry::http::header::CONTENT_TYPE, served.mime)
            // The shell and its modules share one origin, so this buys nothing
            // today; it keeps a module fetch honest if the origins ever split.
            .header("Access-Control-Allow-Origin", "*")
            .body(Cow::Owned(served.body))
            .expect("a response is always well-formed")
    }
}

/// Resolution always crosses back to the main loop: only it holds `WebView`s.
fn deliver(proxy: &EventLoopProxy<RimEvent>, view: ViewKey, outcome: Outcome) {
    match outcome {
        Outcome::Reply { id, response } => {
            let script = protocol::resolve_script(id, &response);
            let _ = proxy.send_event(RimEvent::Reply { view, script });
        }
        Outcome::Drop { reason } => eprintln!("ipc[{view:?}]: dropped message: {reason}"),
    }
}

/// The window, divided: the naked strip first, then the tile leaves inside what
/// the strip leaves over. An empty tab has no leaves — the strip stands alone.
fn layout(window: &Window, view_state: &TreeView, strip: Strip) -> (Rect, Vec<geometry::LeafRect>) {
    let (strip_rect, tiling) = geometry::reserve(window_rect(window), strip, SPACING);
    let leaves = match &view_state.tree {
        Some(tree) => geometry::walk(tree, tiling, SPACING),
        None => Vec::new(),
    };
    (strip_rect, leaves)
}

/// The fixture rim's layout over a bare tree. A zero-width strip reserves
/// nothing.
fn geometry_layout(window: &Window, tree: &Tile, strip: Strip) -> (Rect, Vec<geometry::LeafRect>) {
    let (strip_rect, tiling) = geometry::reserve(window_rect(window), strip, SPACING);
    (strip_rect, geometry::walk(tree, tiling, SPACING))
}

/// The whole window in logical coordinates — the viewport everything else is
/// divided out of.
fn window_rect(window: &Window) -> Rect {
    let size: LogicalSize<f64> = window.inner_size().to_logical(window.scale_factor());
    Rect { x: 0.0, y: 0.0, width: size.width, height: size.height }
}

/// Put a webview where it belongs, and tell it where that is. A page's client
/// coordinates start at its own webview's origin, so an anchor it hands to an
/// overlay is only meaningful once the page knows the origin (`page`).
fn place(webview: &wry::WebView, rect: &Rect) {
    let _ = webview.set_bounds(bounds(rect));
    let _ = webview.evaluate_script(&page::origin_script(rect.x, rect.y));
}

fn bounds(rect: &Rect) -> wry::Rect {
    wry::Rect {
        position: LogicalPosition::new(rect.x, rect.y).into(),
        size: LogicalSize::new(rect.width, rect.height).into(),
    }
}

/// The rim's stand-in page for a program with no bundle yet: names its
/// process, then proves the transport by posting
/// `get`, `scope`, and `subscribe` through `window.__wry_ipc` and rendering
/// what `__sdk.resolve` delivers. The page's `__sdk` is a minimal stand-in
/// for the real SDK's hook surface (sdk.md §Webview transport). The engine
/// path skips the `await` probe — awaiting one's own long-lived process
/// would suspend forever; the stub path keeps it to prove the honest refusal.
fn demo_page(program: &str, process: &str, session: &str, probe_await: bool) -> String {
    const TEMPLATE: &str = r#"<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; height: 100%; background: transparent;
               font: 13px/1.5 -apple-system, system-ui, sans-serif; color: #1d1d1f; }
  .card { box-sizing: border-box; height: 100%; display: flex; flex-direction: column; gap: 4px;
          background: #ffffff; border-radius: 12px; padding: 16px 18px;
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06), 0 3px 10px rgba(0, 0, 0, 0.05); }
  h1 { margin: 0; font-size: 16px; font-weight: 600; }
  .meta { color: #6e6e73; font-size: 12px; }
  .wire { margin-top: auto; font: 11px ui-monospace, monospace; color: #3a3a3c; white-space: pre-wrap; }
</style></head><body><div class="card">
  <h1>__PROGRAM__</h1>
  <div class="meta">process __PROCESS__</div>
  <div class="wire" id="wire">reaching the field…</div>
</div><script>
  const PROC = __PROC_JS__;
  const SESSION = __SESSION_JS__;
  const lines = [];
  const show = (line) => {
    lines.push(line);
    document.getElementById('wire').textContent = lines.join('\n');
  };
  window.__sdk = {
    resolve(id, payload) {
      if (payload.error) { show('#' + id + ' ✗ ' + payload.error.code + ': ' + payload.error.message); return; }
      const r = payload.result;
      if (id === 1) show('get(' + PROC + ') → ' + (r ? 'status ' + r.body.status : 'null'));
      if (id === 2) show('scope(' + SESSION + ') → ' + r.in_scope + ' chunks @ ' + r.head);
      if (id === 3) show('subscribe(' + SESSION + ') → ' + r.subscriptionId);
      if (id === 4) show('await(' + PROC + ') → ' + JSON.stringify(r));
    },
    event(payload) { show('event ' + payload.event); },
  };
  const post = (message) => window.__wry_ipc.postMessage(JSON.stringify(message));
  post({ id: 1, op: 'get', chunkId: PROC });
  post({ id: 2, op: 'scope', scopes: [SESSION] });
  post({ id: 3, op: 'subscribe', scopes: [SESSION] });
  if (__AWAIT_JS__) post({ id: 4, op: 'await', processes: [PROC] });
</script></body></html>"#;

    TEMPLATE
        .replace("__PROGRAM__", program)
        .replace("__PROCESS__", process)
        .replace("__PROC_JS__", &serde_json::to_string(process).expect("json string"))
        .replace("__SESSION_JS__", &serde_json::to_string(session).expect("json string"))
        .replace("__AWAIT_JS__", if probe_await { "true" } else { "false" })
}
