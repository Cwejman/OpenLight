<script lang="ts">
  import type { TileNode as TileNodeType } from '$lib/tiles'
  import TileNode from './TileNode.svelte'
  import { view } from '$lib/state.svelte'

  let { node }: { node: TileNodeType } = $props()
</script>

{#if node.type === 'split'}
  <div class="split {node.direction}" style:--ratio={node.ratio}>
    <div class="pane first">
      <TileNode node={node.children[0]} />
    </div>
    <div class="pane second">
      <TileNode node={node.children[1]} />
    </div>
  </div>
{:else}
  <button
    type="button"
    class="leaf"
    class:focused={view.focusedId === node.id}
    onclick={() => (view.focusedId = node.id)}
  >
    <span class="label">
      {node.scope.length > 0 ? node.scope.join(' / ') : 'empty'}
    </span>
    <span class="id">{node.id}</span>
  </button>
{/if}

<style>
  .split {
    display: flex;
    width: 100%;
    height: 100%;
  }
  .split.horizontal {
    flex-direction: row;
  }
  .split.vertical {
    flex-direction: column;
  }
  .pane.first {
    flex: var(--ratio) 1 0%;
    min-width: 0;
    min-height: 0;
  }
  .pane.second {
    flex: calc(1 - var(--ratio)) 1 0%;
    min-width: 0;
    min-height: 0;
  }

  .leaf {
    width: 100%;
    height: 100%;
    border: 1px solid #1a1a1a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: #0a0a0a;
    color: inherit;
    font: inherit;
    cursor: pointer;
    padding: 0;
  }
  .leaf.focused {
    border-color: #3a5a8a;
  }
  .label {
    color: #666;
    font-size: 0.85rem;
  }
  .id {
    color: #333;
    font-size: 0.7rem;
  }
</style>
