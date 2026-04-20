<script lang="ts">
  import TileNode from '$lib/components/TileNode.svelte'
  import CommandPalette from '$lib/components/CommandPalette.svelte'
  import { view, hydrate } from '$lib/state.svelte'
  import { chord, handleKey } from '$lib/leader.svelte'
  import { findLeaf } from '$lib/tile-ops'

  let { data } = $props()

  $effect(() => {
    hydrate(data.tree)
  })

  const rendered = $derived(
    view.zoomedId ? (findLeaf(view.root, view.zoomedId) ?? view.root) : view.root,
  )
</script>

<svelte:window onkeydown={handleKey} />

<div class="shell">
  <div class="viewport">
    <TileNode node={rendered} />
  </div>

  <div class="status">
    <span>focus: {view.focusedId}</span>
    {#if view.zoomedId}<span class="zoom">zoom</span>{/if}
    {#if chord.active}<span class="chord">␣ {chord.buffer}</span>{/if}
    <span class="hint">␣ leader · ⌘K palette</span>
  </div>
</div>

{#if view.paletteOpen}
  <CommandPalette />
{/if}

<style>
  .shell {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
  }
  .viewport {
    flex: 1;
    min-height: 0;
  }
  .status {
    flex-shrink: 0;
    display: flex;
    gap: 12px;
    padding: 4px 10px;
    background: #0d0d0d;
    border-top: 1px solid #1a1a1a;
    color: #555;
    font-size: 0.75rem;
  }
  .status .hint {
    margin-left: auto;
    color: #444;
  }
  .status .zoom {
    color: #4a9cff;
  }
  .status .chord {
    color: #d0a020;
    font-weight: bold;
  }
</style>
