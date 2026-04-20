<script lang="ts" generics="T extends { id: string; label: string; hint?: string; keybind?: string }">
  import { onMount, tick } from 'svelte'

  type Props = {
    items: T[]
    placeholder?: string
    initialQuery?: string
    autoExecuteOnKeybind?: boolean
    onSelect: (item: T) => void
    onClose: () => void
  }

  let {
    items,
    placeholder = 'Type a command…',
    initialQuery = '',
    autoExecuteOnKeybind = false,
    onSelect,
    onClose,
  }: Props = $props()

  let query = $state(initialQuery)
  let index = $state(0)
  let inputEl: HTMLInputElement | undefined = $state()

  const filtered = $derived(rank(items, query))

  $effect(() => {
    if (index >= filtered.length) index = Math.max(0, filtered.length - 1)
  })

  // Chord mode: if the query exactly matches an item's keybind, run it.
  $effect(() => {
    if (!autoExecuteOnKeybind || !query) return
    const exact = items.find((i) => i.keybind === query)
    if (exact) onSelect(exact)
  })

  onMount(async () => {
    await tick()
    inputEl?.focus()
  })

  // Rank: exact keybind > keybind prefix > label prefix > label fuzzy.
  // Lower score = better match. Non-matches return -1 and are dropped.
  function rank(items: T[], q: string): T[] {
    if (!q) return items
    const lower = q.toLowerCase()
    const scored = items.map((item) => ({ item, score: score(item, q, lower) }))
    return scored
      .filter((x) => x.score >= 0)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.item)
  }

  function score(item: T, q: string, lower: string): number {
    if (item.keybind === q) return 0
    if (item.keybind && item.keybind.startsWith(q)) return 1
    const label = item.label.toLowerCase()
    if (label.startsWith(lower)) return 2
    if (label.includes(lower)) return 3
    if (fuzzy(label, lower)) return 4
    return -1
  }

  function fuzzy(label: string, q: string): boolean {
    let i = 0
    for (let k = 0; k < label.length && i < q.length; k++) {
      if (label[k] === q[i]) i++
    }
    return i === q.length
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
      e.preventDefault()
      index = Math.min(filtered.length - 1, index + 1)
    } else if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
      e.preventDefault()
      index = Math.max(0, index - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[index]
      if (item) onSelect(item)
    }
  }
</script>

<div
  class="overlay"
  role="presentation"
  onclick={(e) => {
    if (e.target === e.currentTarget) onClose()
  }}
>
  <div class="panel" role="dialog">
    <input
      bind:this={inputEl}
      bind:value={query}
      onkeydown={handleKey}
      {placeholder}
      spellcheck="false"
      autocomplete="off"
    />
    <ul>
      {#each filtered as item, i (item.id)}
        <li role="option" aria-selected={i === index}>
          <button
            type="button"
            class:active={i === index}
            onmouseenter={() => (index = i)}
            onclick={() => onSelect(item)}
          >
            <span class="label">{item.label}</span>
            {#if item.hint}<span class="hint">{item.hint}</span>{/if}
            {#if item.keybind}<span class="kb">{item.keybind}</span>{/if}
          </button>
        </li>
      {/each}
      {#if filtered.length === 0}
        <li class="empty">No matches</li>
      {/if}
    </ul>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 15vh;
    z-index: 1000;
  }
  .panel {
    width: min(560px, 90vw);
    background: #111;
    border: 1px solid #2a2a2a;
    border-radius: 6px;
    overflow: hidden;
    font-family: inherit;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  }
  input {
    width: 100%;
    padding: 12px 14px;
    background: #0d0d0d;
    border: 0;
    border-bottom: 1px solid #1f1f1f;
    color: #e8e8e8;
    font: inherit;
    outline: none;
  }
  input::placeholder {
    color: #555;
  }
  ul {
    list-style: none;
    max-height: 50vh;
    overflow-y: auto;
  }
  li {
    list-style: none;
  }
  li button {
    display: flex;
    width: 100%;
    align-items: baseline;
    gap: 10px;
    padding: 8px 14px;
    cursor: pointer;
    color: #c8c8c8;
    background: transparent;
    border: 0;
    font: inherit;
    text-align: left;
  }
  li button.active {
    background: #1a1a1a;
    color: #f0f0f0;
  }
  li.empty {
    padding: 8px 14px;
    color: #555;
    cursor: default;
  }
  .label {
    flex: 1;
  }
  .hint {
    color: #666;
    font-size: 0.85em;
  }
  .kb {
    color: #777;
    background: #1a1a1a;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 0.85em;
  }
</style>
