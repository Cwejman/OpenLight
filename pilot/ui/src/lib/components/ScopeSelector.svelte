<script lang="ts">
  import Selector from './Selector.svelte'
  import { view, closeScopeSelector } from '../state.svelte'
  import { findLeaf } from '../tile-ops'
  import { navigateMutation } from '../tile-mutations'
  import { applyMutation } from '../apply'

  type Item = { id: string; label: string; chunkId: string }

  const items: Item[] = $derived(
    view.allChunks.map((c) => ({ id: c.id, label: c.name, chunkId: c.id })),
  )

  async function handleSelect(item: Item) {
    closeScopeSelector()
    const leaf = findLeaf(view.root, view.focusedId)
    if (!leaf) return
    await applyMutation(navigateMutation(leaf, [item.chunkId]))
  }
</script>

<Selector
  {items}
  placeholder="Scope to…"
  onSelect={handleSelect}
  onClose={closeScopeSelector}
/>
