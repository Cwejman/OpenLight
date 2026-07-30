// The program's entry (host.md §Authoring Programs): the host serves this file
// itself over `ol://`, as the empty shell's one module script. The shell holds
// nothing — the program mounts the document's body. Nothing else happens at
// module scope.
import { createRoot } from 'react-dom/client'
import { Sidebar, Strip } from './sidebar.tsx'

// The host stamps the running process's id on the page before the module loads;
// the name is declared once, in @openlight/sdk's `globals.d.ts`.
const process = window.__openlight_process

createRoot(document.body).render(
  process ? <Sidebar process={process} /> : <Strip status="no process identity on this page" />,
)
