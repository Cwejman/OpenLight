// The built artifact, not the source: the bundle the host loads is evaluated in
// a DOM that looks like the page shell — `#root` present, `window.__wry_ipc`
// installed, the process id stamped — with the fixture engine behind the IPC
// channel. This is the one test that exercises the wry transport's own
// selection path (sdk.md, *Transports*, order 2) and `createRoot` against the
// host-provided root.
import { expect, test } from 'bun:test'
import { fixtureTransport } from '@openlight/sdk/fixture'

const BUNDLE = `${import.meta.dir}/../read-tile.js`

test('the built bundle renders the session it is pointed at', async () => {
  const built = Bun.file(BUNDLE)
  expect(await built.exists()).toBe(true)

  const engine = fixtureTransport({
    given: [
      {
        chunks: [
          { id: 'p_1', body: { status: 'running' } },
          { id: 'arg', name: 'request', body: { target: ['session-main'] } },
          { id: 'session-main', name: 'main', body: { text: 'Initial session.' } },
          { id: 'a', name: 'read-tile' },
          { id: 'b', name: 'sidebar' },
        ],
        placements: [
          { chunk: 'arg', scope: 'p_1', type: 'instance' },
          { chunk: 'a', scope: 'session-main', type: 'instance' },
          { chunk: 'b', scope: 'session-main', type: 'instance' },
        ],
      },
    ],
  })

  // The bundle carries its own copy of the SDK, which selects at its own module
  // load — the pre-set transport another test file installed must not win here.
  const preset = (globalThis as Record<string, unknown>).__openlight_transport
  delete (globalThis as Record<string, unknown>).__openlight_transport

  document.body.innerHTML = '<div id="root"></div>'
  const view = window as unknown as {
    __wry_ipc?: { postMessage: (message: string) => void }
    __sdk?: { resolve: (id: number, payload: unknown) => void; event: (payload: unknown) => void }
    __openlight_process?: string
  }
  view.__openlight_process = 'p_1'
  view.__wry_ipc = {
    postMessage(message) {
      const request = JSON.parse(message)
      void engine.send(request).then((response) => view.__sdk?.resolve(request.id, response))
    },
  }
  engine.onEvent((event) => view.__sdk?.event(event))

  // The host injects the bundle as the page's only script; the shell escapes a
  // literal closing tag the same way (`host/src/page.rs`).
  const source = (await built.text()).replaceAll('</script', '<\\/script')
  new Function(source)()
  await new Promise((resolve) => setTimeout(resolve, 50))

  const root = document.getElementById('root')!
  expect(root.querySelector('h1')?.textContent).toBe('main')
  expect(root.querySelector('.head .prose')?.textContent).toBe('Initial session.')
  expect([...root.querySelectorAll('.row .name')].map((n) => n.textContent)).toEqual([
    'read-tile',
    'sidebar',
  ])
  expect(root.querySelector('.content')?.getAttribute('data-mode')).toBe('cards')

  if (preset) (globalThis as Record<string, unknown>).__openlight_transport = preset
})
