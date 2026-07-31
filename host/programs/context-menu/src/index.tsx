// The program's entry (host.md §Authoring Programs): the host serves this file
// itself over `ol://`, as the empty shell's one module script. The shell holds
// nothing — the program mounts the document's body. Nothing else happens at
// module scope.
import { createRoot } from 'react-dom/client'
import { ContextMenu } from './menu.tsx'

// The host stamps the running process's id on the page before the module loads;
// the name is declared once, in @openlight/sdk's `globals.d.ts`.
const process = window.__openlight_process

// With no identity there is no call frame, and so no menu — and no `exit`
// either, since that op speaks as a process. The pane renders nothing; the run
// ends on its own timeout.
createRoot(document.body).render(process ? <ContextMenu process={process} /> : null)
