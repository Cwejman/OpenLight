// The built artifacts, not the sources: the bundles the host loads are evaluated
// in a DOM that looks like the page shell — `#root` present, `window.__wry_ipc`
// installed, the process id stamped — with the fixture engine behind the IPC
// channel. This is the one file that exercises the wry transport's own selection
// path (sdk.md, *Transports*, order 2) and `createRoot` against the host root.
import { expect, test } from 'bun:test'
import { fixtureTransport, type FixtureTransport } from '@openlight/sdk/fixture'

const DIR = `${import.meta.dir}/..`

/**
 * Stand the page shell up around a bundle and run it, exactly as the host does.
 * Each bundle carries its own copy of the SDK, which selects its transport at
 * its own module load — the pre-set transport another test file installed must
 * not win here, so it steps aside for the run.
 */
async function load(bundle: string, process: string, engine: FixtureTransport): Promise<Element> {
  const built = Bun.file(`${DIR}/${bundle}`)
  expect(await built.exists()).toBe(true)

  const preset = (globalThis as Record<string, unknown>).__openlight_transport
  delete (globalThis as Record<string, unknown>).__openlight_transport

  document.body.innerHTML = '<div id="root"></div>'
  const view = window as unknown as {
    __wry_ipc?: { postMessage: (message: string) => void }
    __sdk?: { resolve: (id: number, payload: unknown) => void; event: (payload: unknown) => void }
    __openlight_process?: string
  }
  view.__openlight_process = process
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

  if (preset) (globalThis as Record<string, unknown>).__openlight_transport = preset
  return document.getElementById('root')!
}

test('the built read-tile renders the session it is pointed at', async () => {
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

  const root = await load('read-tile.js', 'p_1', engine)

  expect(root.querySelector('h1')?.textContent).toBe('main')
  expect(root.querySelector('.head .prose')?.textContent).toBe('Initial session.')
  expect([...root.querySelectorAll('.row .name')].map((n) => n.textContent)).toEqual([
    'read-tile',
    'sidebar',
  ])
  expect(root.querySelector('.content')?.getAttribute('data-mode')).toBe('cards')
})

test('the built sidebar renders the session as its processes', async () => {
  const engine = fixtureTransport({
    given: [
      {
        chunks: [
          { id: 'engine/process', name: 'process' },
          { id: 'engine/program', name: 'program' },
          { id: 'session-main', name: 'main' },
          { id: 'host/read-tile', name: 'read-tile' },
          { id: 'host/sidebar', name: 'sidebar' },
          { id: 'p_2', body: { status: 'running' } },
          { id: 'arg', name: 'request', body: { session: 'session-main' } },
          { id: 'p_gone', body: { status: 'completed' } },
        ],
        placements: [
          { chunk: 'host/read-tile', scope: 'engine/program', type: 'instance' },
          { chunk: 'host/sidebar', scope: 'engine/program', type: 'instance' },
          { chunk: 'arg', scope: 'p_2', type: 'instance' },
          { chunk: 'p_2', scope: 'engine/process', type: 'instance' },
          { chunk: 'p_2', scope: 'host/sidebar', type: 'instance' },
          { chunk: 'p_2', scope: 'session-main', type: 'instance' },
          { chunk: 'p_gone', scope: 'engine/process', type: 'instance' },
          { chunk: 'p_gone', scope: 'host/read-tile', type: 'instance' },
          { chunk: 'p_gone', scope: 'session-main', type: 'instance' },
        ],
      },
    ],
  })

  const root = await load('sidebar.js', 'p_2', engine)

  expect([...root.querySelectorAll('.item .program')].map((n) => n.textContent)).toEqual([
    'sidebar',
    'read-tile',
  ])
  expect([...root.querySelectorAll('.item.card .program')].map((n) => n.textContent)).toEqual([
    'sidebar',
  ])
  expect([...root.querySelectorAll('.item.flat .program')].map((n) => n.textContent)).toEqual([
    'read-tile',
  ])
})
