//! The hollow host rim — deliberately thin, verified by running. One tao
//! window; a wry child webview per leaf of the demo tile tree, positioned by
//! `geometry::walk`; per-webview IPC handlers (host.md §Transport)
//! dispatching to the `FixtureStub`. Everything with logic lives in the pure
//! modules; this file only wires tao/wry to them.

use std::collections::HashMap;
use std::sync::Arc;

use tao::{
    dpi::{LogicalPosition, LogicalSize},
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoopBuilder, EventLoopProxy},
    window::{Window, WindowBuilder},
};
use wry::WebViewBuilder;

use host::compose::{self, ProcessInfo};
use host::dispatch::{self, Context, Outcome, Parsed};
use host::field;
use host::geometry::{self, Rect, Spacing, Tile};
use host::protocol;
use host::stub::FixtureStub;

// Visual tokens are an open (host.md §What Is Open) — parameters here,
// values settled by eye.
const SPACING: Spacing = Spacing { padding: 14.0, gap: 10.0 };

/// engine.md §Key mechanics: the engine side never holds a `WebView`; script
/// evaluation crosses to the main loop as data, addressed by process. Same
/// shape and key as the engine's `HostCmd::EvaluateScript`; the real engine's
/// set adds webview mount and unmount.
enum HostCmd {
    EvaluateScript { process_id: String, script: String },
}

// host.md §Transport names `window.__wry_ipc.postMessage`; wry itself
// injects `window.ipc` — the host provides the specced name.
const WRY_IPC_ALIAS: &str =
    "window.__wry_ipc = { postMessage: (message) => window.ipc.postMessage(message) };";

fn main() {
    // host.md §Boot sequence, step 1: the runtime comes first — the engine
    // seam's ops run on it, tao's event loop stays on the main thread.
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("tokio runtime");

    let (chunks, placements) = field::demo();
    let stub = Arc::new(FixtureStub::new(chunks.clone(), placements.clone()));

    let (tiles, tree_placements) =
        compose::tile_inputs(&chunks, &placements, field::HOST_TILE).expect("demo tile bodies");
    let tree = geometry::parse(field::DEMO_TAB, &tiles, &tree_placements).expect("demo tile tree");

    let event_loop = EventLoopBuilder::<HostCmd>::with_user_event().build();
    let window = WindowBuilder::new()
        .with_title("OpenLight — hollow host")
        .with_inner_size(LogicalSize::new(1280.0, 840.0))
        .build(&event_loop)
        .expect("window");

    // Webviews are keyed by process, the identity the engine addresses them
    // by; the leaf map is geometry's separate concern.
    let mut webviews: HashMap<String, wry::WebView> = HashMap::new();
    let mut leaf_process: HashMap<String, String> = HashMap::new();
    for leaf in layout(&window, &tree) {
        let info = compose::leaf_process(
            &chunks,
            &placements,
            &leaf.id,
            field::ENGINE_PROCESS,
            field::ENGINE_PROGRAM,
        )
        .expect("every demo leaf displays a process");
        let webview = WebViewBuilder::new()
            .with_bounds(bounds(&leaf.rect))
            .with_transparent(true)
            .with_initialization_script(WRY_IPC_ALIAS)
            .with_html(demo_page(&info))
            .with_ipc_handler(ipc_handler(
                stub.clone(),
                runtime.handle().clone(),
                event_loop.create_proxy(),
                Context { process_id: Some(info.process.clone()) },
            ))
            .build_as_child(&window)
            .expect("webview");
        leaf_process.insert(leaf.id, info.process.clone());
        webviews.insert(info.process, webview);
    }

    event_loop.run(move |event, _, control_flow| {
        // Moved in so the runtime outlives the loop that feeds it — a
        // `Handle` alone does not keep its workers alive.
        let _runtime = &runtime;
        *control_flow = ControlFlow::Wait;
        match event {
            Event::WindowEvent { event: WindowEvent::CloseRequested, .. } => {
                *control_flow = ControlFlow::Exit;
            }
            Event::WindowEvent { event: WindowEvent::Resized(_), .. } => {
                for leaf in layout(&window, &tree) {
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

/// host.md §Transport: per-webview `set_ipc_handler`; each message is parsed,
/// gets the webview's `Context { process_id }` attached, dispatches to the
/// engine seam, and resolves via `__sdk.resolve` on the main loop. Parsing is
/// all that happens on wry's callback thread — the engine call goes to the
/// runtime, because `await` suspends until the awaited processes end.
fn ipc_handler(
    stub: Arc<FixtureStub>,
    runtime: tokio::runtime::Handle,
    proxy: EventLoopProxy<HostCmd>,
    ctx: Context,
) -> impl Fn(wry::http::Request<String>) + 'static {
    // Checked at mount, never inside the callback: a webview always speaks as
    // its process (host.md §Transport, the webview→process registry).
    let process = ctx.process_id.clone().expect("webview context names a process");
    move |message| match dispatch::parse(message.body()) {
        Parsed::Execute(request) => {
            let (stub, ctx, proxy, process) =
                (stub.clone(), ctx.clone(), proxy.clone(), process.clone());
            runtime.spawn(async move {
                let outcome = dispatch::execute(stub.as_ref(), &ctx, &request).await;
                deliver(&proxy, &process, outcome);
            });
        }
        Parsed::Settled(outcome) => deliver(&proxy, &process, outcome),
    }
}

/// Resolution always crosses back to the main loop: only it holds `WebView`s.
fn deliver(proxy: &EventLoopProxy<HostCmd>, process: &str, outcome: Outcome) {
    match outcome {
        Outcome::Reply { id, response } => {
            let script = protocol::resolve_script(id, &response);
            let _ = proxy.send_event(HostCmd::EvaluateScript {
                process_id: process.to_string(),
                script,
            });
        }
        Outcome::Drop { reason } => eprintln!("ipc[{process}]: dropped message: {reason}"),
    }
}

fn layout(window: &Window, tree: &Tile) -> Vec<geometry::LeafRect> {
    let size: LogicalSize<f64> = window.inner_size().to_logical(window.scale_factor());
    let viewport = Rect { x: 0.0, y: 0.0, width: size.width, height: size.height };
    geometry::walk(tree, viewport, SPACING)
}

fn bounds(rect: &Rect) -> wry::Rect {
    wry::Rect {
        position: LogicalPosition::new(rect.x, rect.y).into(),
        size: LogicalSize::new(rect.width, rect.height).into(),
    }
}

/// A demo tile: names its process, then proves the transport by posting
/// `get`, `scope`, and `subscribe` through `window.__wry_ipc` and rendering
/// what `__sdk.resolve` delivers. The page's `__sdk` is a minimal stand-in
/// for the real SDK's hook surface (sdk.md §Webview transport).
fn demo_page(info: &ProcessInfo) -> String {
    const TEMPLATE: &str = r#"<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; height: 100%; background: transparent;
               font: 13px/1.5 -apple-system, system-ui, sans-serif; color: #1d1d1f; }
  .card { box-sizing: border-box; height: 100%; display: flex; flex-direction: column; gap: 4px;
          background: #ffffff; border: 1px solid #e3e3e6; border-radius: 12px;
          padding: 16px 18px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); }
  h1 { margin: 0; font-size: 16px; font-weight: 600; }
  .meta { color: #6e6e73; font-size: 12px; }
  .wire { margin-top: auto; font: 11px ui-monospace, monospace; color: #3a3a3c; white-space: pre-wrap; }
</style></head><body><div class="card">
  <h1>__PROGRAM__</h1>
  <div class="meta">process __PROCESS__ · __STATUS__</div>
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
  // The suspending op: parsed on the IPC thread, run on the tokio runtime,
  // resolved back through the event loop. The stub refuses it, honestly.
  post({ id: 4, op: 'await', processes: [PROC] });
</script></body></html>"#;

    TEMPLATE
        .replace("__PROGRAM__", &info.program)
        .replace("__PROCESS__", &info.process)
        .replace("__STATUS__", info.status.as_deref().unwrap_or("unknown"))
        .replace("__PROC_JS__", &serde_json::to_string(&info.process).expect("json string"))
        .replace("__SESSION_JS__", &serde_json::to_string(field::DEMO_SESSION).expect("json string"))
}
