//! The host rim — deliberately thin, verified by running. One tao window; the
//! sidebar as a naked strip beside the tiling area (`geometry::reserve`, host.md
//! §Sidebar) and a wry child webview per leaf of the demo tile tree inside what
//! it leaves (`geometry::walk`); per-webview IPC handlers (host.md §Transport)
//! dispatching through the `EngineApi` seam. The rim chooses the implementor at runtime:
//! the real `engine::Engine` behind `EngineAdapter` by default (the swap,
//! board.md build track step 5), the `FixtureStub` under `--fixture`.
//! A program whose source entry exists on disk is served over the `ol://`
//! custom protocol (`serve`, `transpile`) — the empty shell plus its own
//! modules, transpiled per file; the surfaces without one keep [`demo_page`]
//! until theirs is written. Everything with logic lives in the pure modules;
//! this file wires tao/wry.
//!
//! `--probe` runs the same boot and then asks each mounted surface what its
//! DOM became, one JSON line per webview on stdout, and exits (`probe`).

use std::borrow::Cow;
use std::collections::{HashMap, HashSet};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use tao::{
    dpi::{LogicalPosition, LogicalSize},
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop, EventLoopBuilder, EventLoopProxy},
    window::{Theme, Window, WindowBuilder},
};
use wry::WebViewBuilder;

use db::ChunkId;
use engine::{HostCmd, ProcessId, TerminalReason};
use host::adapter::EngineAdapter;
use host::boot::{self, Booted, Surface, TileProcess};
use host::compose::{self, ProcessInfo};
use host::dispatch::{self, Context, EngineApi, Outcome, Parsed};
use host::field;
use host::geometry::{self, Bleed, Rect, Spacing, Strip, Tile};
use host::page;
use host::probe;
use host::protocol;
use host::serve;
use host::stub::FixtureStub;
use host::transpile::Transpiler;

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

// ---- the real thing: webviews reading seeded substrate through the engine --

fn engine_main(runtime: tokio::runtime::Runtime, args: &[String]) {
    let cwd = std::env::current_dir().expect("cwd");
    let active = boot::resolve_active_path(args, &cwd);

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
    let Booted { engine, mut host_rx, provider, session, tiles, strip, programs_root } = booted;
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

    let tree = demo_tree(&tiles);
    let strip_process = strip.process.clone();
    let program_names: HashMap<ProcessId, String> = tiles
        .iter()
        .chain(std::iter::once(&strip))
        .map(|t| (t.process.clone(), t.program.clone()))
        .collect();

    // The probe lane (board.md's layout-as-data jewel, thin end): boot whole,
    // then ask each surface what its DOM became. Nothing else changes.
    let probing = args.iter().any(|a| a == "--probe");

    let event_loop: EventLoop<HostCmd> = EventLoopBuilder::with_user_event().build();
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
            if forward_proxy.send_event(cmd).is_err() {
                return; // event loop gone; shutdown owns the rest
            }
        }
    });

    let mut webviews: HashMap<ProcessId, wry::WebView> = HashMap::new();
    let mut terminals: HashMap<ProcessId, tokio::sync::oneshot::Sender<TerminalReason>> =
        HashMap::new();
    // The overlay layer (host.md §Overlays): processes whose program declares
    // `surface: 'overlay'`. They hold the whole window rather than a rectangle
    // in the tree, so they are the one set geometry does not describe — and
    // they are created after the boot suite, which is what puts them on top.
    let mut overlays: HashSet<ProcessId> = HashSet::new();
    let proxy = event_loop.create_proxy();

    // Every surface owes exactly one report. The deadline is the lane's
    // honesty: a probe that never completes must fail, not hang.
    let tally = Arc::new(Mutex::new(probe::Tally::new(program_names.len())));
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
                shutdown(&runtime, &engine, &mut webviews, &mut terminals, control_flow);
            }
            Event::WindowEvent { event: WindowEvent::Resized(_), .. } => {
                // Strip and tiles move together — the tiling area is defined as
                // what the strip leaves, so one walk keeps both coherent.
                let (strip_rect, leaves) = layout(&window, &tree, STRIP);
                if let Some(webview) = webviews.get(&strip_process) {
                    place(webview, &strip_rect);
                }
                for leaf in &leaves {
                    if let Some(webview) = webviews.get(&ChunkId::from(leaf.id.as_str())) {
                        place(webview, &leaf.rect);
                        // The aura is cut to the tile, so it is re-cut with it.
                        cast_aura(webview, &leaf.rect);
                    }
                }
                // An overlay spans the window, whatever the window becomes.
                let whole = window_rect(&window);
                for process in &overlays {
                    if let Some(webview) = webviews.get(process) {
                        place(webview, &whole);
                    }
                }
            }
            Event::UserEvent(HostCmd::MountWebview { process_id, executable }) => {
                let Some(pending) = provider.take_pending(&process_id) else {
                    return; // unknown or already claimed; nothing to mount
                };
                // Where the webview goes is the program's own declaration, read
                // off the field: an overlay takes the window, everything else
                // takes the rectangle geometry gives it (host.md §Overlays).
                let (declared_name, surface) = boot::program_kind(&engine, &pending.program);
                let (strip_rect, leaves) = layout(&window, &tree, STRIP);
                let placed = match surface {
                    Surface::Overlay => Some(window_rect(&window)),
                    Surface::Tile if process_id == strip_process => Some(strip_rect),
                    Surface::Tile => {
                        leaves.into_iter().find(|l| l.id == process_id.as_str()).map(|l| l.rect)
                    }
                };
                let Some(rect) = placed else {
                    eprintln!("host: no surface for process {process_id}; dropping mount");
                    return; // pending drops: engine reads it as killed
                };
                let program = program_names
                    .get(&process_id)
                    .cloned()
                    .or(declared_name)
                    .unwrap_or_else(|| pending.executable.clone());
                let builder = WebViewBuilder::new()
                    .with_bounds(bounds(&rect))
                    .with_transparent(true)
                    .with_initialization_script(&page::init_script(
                        process_id.as_str(),
                        rect.x,
                        rect.y,
                    ))
                    .with_ipc_handler(ipc_handler(
                        engine_api.clone(),
                        runtime.handle().clone(),
                        proxy.clone(),
                        Context { process_id: Some(process_id.as_str().to_string()) },
                        probing.then(|| ProbeSink {
                            program: program.clone(),
                            tally: tally.clone(),
                            proxy: proxy.clone(),
                        }),
                    ));
                // A program whose entry exists on disk is served over `ol://`;
                // the rest keep the rim's demo HTML until theirs is written
                // (host.md §Authoring Programs).
                let entry = programs_root.join(&executable);
                let builder = if entry.is_file() {
                    builder
                        .with_custom_protocol(
                            serve::SCHEME.into(),
                            module_protocol(
                                transpiler.clone(),
                                source_root.clone(),
                                process_id.as_str().to_string(),
                                entry,
                            ),
                        )
                        .with_url(serve::shell_url(process_id.as_str()))
                } else {
                    builder.with_html(demo_page(
                        &program,
                        process_id.as_str(),
                        session.as_str(),
                        false,
                    ))
                };
                let webview = builder.build_as_child(&window).expect("webview");
                // Only a tile floats: the strip is naked on the canvas, and an
                // overlay is a transparent pane whose own panel casts its shadow
                // in CSS — the aura belongs to what the *window* frames.
                if surface == Surface::Overlay {
                    overlays.insert(process_id.clone());
                    // The pane is the whole window and takes every click; it
                    // must take the keys too, or Escape never reaches it.
                    let _ = webview.focus();
                } else if process_id != strip_process {
                    cast_aura(&webview, &rect);
                }
                webviews.insert(process_id.clone(), webview);
                if probing {
                    // Through the ordinary delivery path, once the surface has
                    // had time to read its scope and render.
                    let (pid, probe_proxy) = (process_id.clone(), proxy.clone());
                    runtime.spawn(async move {
                        tokio::time::sleep(PROBE_SETTLE).await;
                        let script = probe::script(probe::HTML_LIMIT, probe::NODE_LIMIT);
                        let _ = probe_proxy
                            .send_event(HostCmd::EvaluateScript { process_id: pid, script });
                    });
                }
                let _ = pending.ready.send(());
                terminals.insert(process_id.clone(), pending.terminal);
                // Outgoing engine traffic (subscription events) becomes
                // delivery scripts; a closed channel is the engine's kill
                // signal — unmount follows.
                let mut events = pending.events;
                let drain_proxy = proxy.clone();
                runtime.spawn(async move {
                    while let Some(payload) = events.recv().await {
                        let script = protocol::delivery_script(&payload);
                        let cmd =
                            HostCmd::EvaluateScript { process_id: process_id.clone(), script };
                        if drain_proxy.send_event(cmd).is_err() {
                            return;
                        }
                    }
                    let _ = drain_proxy.send_event(HostCmd::UnmountWebview { process_id });
                });
            }
            Event::UserEvent(HostCmd::UnmountWebview { process_id }) => {
                // The probe lane's one seam into the loop: no process is named
                // this, so the ordinary unmount stays what it was.
                if process_id.as_str() == probe::DONE {
                    shutdown(&runtime, &engine, &mut webviews, &mut terminals, control_flow);
                    return;
                }
                webviews.remove(&process_id);
                terminals.remove(&process_id);
                overlays.remove(&process_id);
            }
            Event::UserEvent(HostCmd::EvaluateScript { process_id, script }) => {
                if let Some(webview) = webviews.get(&process_id) {
                    let _ = webview.evaluate_script(&script);
                }
            }
            _ => {}
        }
    });
}

/// The demo tile tree, still composed host-side (the swap unit's sanctioned
/// remainder) — genuine tile content only, the reader as its sole leaf. Leaf
/// ids are the process ids, so geometry and webview registry share one key.
fn demo_tree(tiles: &[TileProcess]) -> Tile {
    assert_eq!(tiles.len(), 1, "the demo tree shows the tile programs");
    Tile::Leaf { id: tiles[0].process.as_str().to_string() }
}

// ---- the hollow host, kept runnable for comparison: `--fixture` -------------

fn fixture_main(runtime: tokio::runtime::Runtime) {
    let (chunks, placements) = field::demo();
    let stub: Arc<dyn EngineApi> = Arc::new(FixtureStub::new(chunks.clone(), placements.clone()));

    let (tiles, tree_placements) =
        compose::tile_inputs(&chunks, &placements, field::HOST_TILE).expect("demo tile bodies");
    let tree = geometry::parse(field::DEMO_TAB, &tiles, &tree_placements).expect("demo tile tree");

    let event_loop: EventLoop<HostCmd> = EventLoopBuilder::with_user_event().build();
    let window = WindowBuilder::new()
        .with_title("OpenLight — hollow host (fixture)")
        .with_inner_size(LogicalSize::new(1280.0, 840.0))
        .with_theme(Some(Theme::Light))
        .build(&event_loop)
        .expect("window");
    paint_canvas(&window);

    // Webviews are keyed by process, the identity the engine addresses them
    // by; the leaf map is geometry's separate concern.
    let mut webviews: HashMap<ProcessId, wry::WebView> = HashMap::new();
    let mut leaf_process: HashMap<String, ProcessId> = HashMap::new();
    // The fixture rim keeps its three-tile demo: no strip, so no reservation.
    let (_, leaves) = layout(&window, &tree, Strip { width: 0.0, bleed: Bleed::NONE });
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
                Context { process_id: Some(info.process.clone()) },
                None,
            ))
            .build_as_child(&window)
            .expect("webview");
        leaf_process.insert(leaf.id, ChunkId::from(info.process.as_str()));
        webviews.insert(ChunkId::from(info.process.as_str()), webview);
    }

    event_loop.run(move |event, _, control_flow| {
        let _runtime = &runtime;
        *control_flow = ControlFlow::Wait;
        match event {
            Event::WindowEvent { event: WindowEvent::CloseRequested, .. } => {
                *control_flow = ControlFlow::Exit;
            }
            Event::WindowEvent { event: WindowEvent::Resized(_), .. } => {
                let (_, leaves) = layout(&window, &tree, Strip { width: 0.0, bleed: Bleed::NONE });
                for leaf in leaves {
                    if let Some(webview) = leaf_process.get(&leaf.id).and_then(|p| webviews.get(p)) {
                        let _ = webview.set_bounds(bounds(&leaf.rect));
                    }
                }
            }
            Event::UserEvent(HostCmd::EvaluateScript { process_id, script }) => {
                if let Some(webview) = webviews.get(&process_id) {
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
    webviews: &mut HashMap<ProcessId, wry::WebView>,
    terminals: &mut HashMap<ProcessId, tokio::sync::oneshot::Sender<TerminalReason>>,
    control_flow: &mut ControlFlow,
) {
    webviews.clear();
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
    proxy: EventLoopProxy<HostCmd>,
}

/// host.md §Transport: per-webview `set_ipc_handler`; each message is parsed,
/// gets the webview's `Context { process_id }` attached, dispatches to the
/// engine seam, and resolves via `__sdk.resolve` on the main loop. Parsing is
/// all that happens on wry's callback thread — the engine call goes to the
/// runtime, because `await` suspends until the awaited processes end.
fn ipc_handler(
    engine: Arc<dyn EngineApi>,
    runtime: tokio::runtime::Handle,
    proxy: EventLoopProxy<HostCmd>,
    ctx: Context,
    probe_sink: Option<ProbeSink>,
) -> impl Fn(wry::http::Request<String>) + 'static {
    // Checked at mount, never inside the callback: a webview always speaks as
    // its process (host.md §Transport, the webview→process registry).
    let process = ctx.process_id.clone().expect("webview context names a process");
    move |message| {
        // The probe answer rides the same channel, read before dispatch and
        // recognized by its envelope alone — ordinary traffic never matches.
        if let Some(sink) = &probe_sink {
            if let Some(report) = probe::parse(message.body()) {
                println!("{}", probe::line(&process, &sink.program, &report));
                if sink.tally.lock().expect("tally").record() {
                    let _ = sink.proxy.send_event(HostCmd::UnmountWebview {
                        process_id: ChunkId::from(probe::DONE),
                    });
                }
                return;
            }
        }
        match dispatch::parse(message.body()) {
            Parsed::Execute(request) => {
                let (engine, ctx, proxy, process) =
                    (engine.clone(), ctx.clone(), proxy.clone(), process.clone());
                runtime.spawn(async move {
                    let outcome = dispatch::execute(engine.as_ref(), &ctx, &request).await;
                    deliver(&proxy, &process, outcome);
                });
            }
            Parsed::Settled(outcome) => deliver(&proxy, &process, outcome),
        }
    }
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
    process: String,
    entry: std::path::PathBuf,
) -> impl Fn(wry::WebViewId, wry::http::Request<Vec<u8>>) -> wry::http::Response<Cow<'static, [u8]>>
{
    move |_id, request| {
        let served = serve::serve(&transpiler, &root, &process, &entry, request.uri().path());
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
fn deliver(proxy: &EventLoopProxy<HostCmd>, process: &str, outcome: Outcome) {
    match outcome {
        Outcome::Reply { id, response } => {
            let script = protocol::resolve_script(id, &response);
            let _ = proxy.send_event(HostCmd::EvaluateScript {
                process_id: ChunkId::from(process),
                script,
            });
        }
        Outcome::Drop { reason } => eprintln!("ipc[{process}]: dropped message: {reason}"),
    }
}

/// The window, divided: the naked strip first, then the tile leaves inside what
/// the strip leaves over. A zero-width strip reserves nothing (the fixture rim).
fn layout(window: &Window, tree: &Tile, strip: Strip) -> (Rect, Vec<geometry::LeafRect>) {
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
