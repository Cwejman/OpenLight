// Preloaded (bunfig.toml): a DOM has to exist before `react-dom/client` is
// imported anywhere in the suite, and React's `act` refuses to run without the
// environment flag.
import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()
;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true
