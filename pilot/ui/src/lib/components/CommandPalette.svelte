<script lang="ts">
  import Selector from './Selector.svelte'
  import { commands, type Command } from '../commands'
  import { view, closePalette } from '../state.svelte'

  type Item = { id: string; label: string; keybind?: string; command: Command }

  const items: Item[] = commands.map((c) => ({
    id: c.id,
    label: c.name,
    keybind: c.keybind,
    command: c,
  }))

  function handleSelect(item: Item) {
    closePalette()
    item.command.run()
  }
</script>

<Selector
  {items}
  initialQuery={view.paletteInitialQuery}
  autoExecuteOnKeybind={view.paletteChordMode}
  onSelect={handleSelect}
  onClose={closePalette}
/>
