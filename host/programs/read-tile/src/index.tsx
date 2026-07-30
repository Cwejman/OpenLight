// The program's entry (host.md §Authoring Programs): the host serves this file
// itself over `ol://`, as the empty shell's one module script. The shell holds
// nothing — the program mounts the document's body. Nothing else happens at
// module scope.
import { createRoot } from 'react-dom/client'
import { Frame, ReadTile } from './tile.tsx'
import type { ChunkId } from '@openlight/sdk'

// The host stamps the running process's id on the page before the module loads.
// No op returns it and no spec names the channel — recorded gap (host.md
// §Transport / §Authoring Programs).
declare global {
  interface Window {
    __openlight_process?: ChunkId
  }
}

const process = window.__openlight_process

createRoot(document.body).render(
  process ? <ReadTile process={process} /> : <Frame error="no process identity on this page" />,
)
