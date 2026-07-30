// The bundle entry (host.md §Authoring Programs): the host loads this file into
// a webview whose page already holds `<div id="root"></div>`, and the program
// renders into it. Nothing else happens at module scope.
import { createRoot } from 'react-dom/client'
import { Sidebar, Strip } from './sidebar.tsx'
import type { ChunkId } from '@openlight/sdk'

// The host stamps the running process's id on the page before the bundle loads.
// No op returns it and no spec names the channel — recorded gap (host.md
// §Transport / §Authoring Programs), shared with the read-tile.
declare global {
  interface Window {
    __openlight_process?: ChunkId
  }
}

const process = window.__openlight_process

createRoot(document.getElementById('root')!).render(
  process ? <Sidebar process={process} /> : <Strip status="no process identity on this page" />,
)
