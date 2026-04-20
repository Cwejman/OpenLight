<script lang="ts">
  import type { TileLeaf } from '../tiles'
  import { navigateMutation } from '../tile-mutations'
  import { applyMutation } from '../apply'

  type ChunkLite = {
    id: string
    name?: string
    spec: Record<string, unknown>
    body: Record<string, unknown>
    placements: Array<{ chunk_id: string; scope_id: string; type: string; seq?: number }>
  }

  type ScopeData = {
    scope: ChunkLite[]
    items: ChunkLite[]
  }

  let { leaf }: { leaf: TileLeaf } = $props()

  let data = $state<ScopeData | null>(null)
  let loading = $state(false)
  let error = $state<string | null>(null)

  $effect(() => {
    const ids = leaf.scope
    if (ids.length === 0) {
      data = null
      return
    }
    loading = true
    error = null
    const url = `/api/scope?ids=${ids.map(encodeURIComponent).join(',')}`
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status}: ${await r.text()}`)
        return r.json() as Promise<ScopeData>
      })
      .then((d) => {
        data = d
        loading = false
      })
      .catch((e) => {
        error = String(e)
        loading = false
      })
  })

  const isOrdered = $derived(
    data?.scope.some((s) => (s.spec as { ordered?: boolean }).ordered) ?? false,
  )

  const sortedItems = $derived.by(() => {
    if (!data) return []
    if (!isOrdered) return data.items
    return [...data.items].sort((a, b) => {
      const aSeq = seqIn(a, leaf.scope)
      const bSeq = seqIn(b, leaf.scope)
      return (aSeq ?? Infinity) - (bSeq ?? Infinity)
    })
  })

  function seqIn(chunk: ChunkLite, scopeIds: string[]): number | undefined {
    for (const p of chunk.placements) {
      if (p.type === 'instance' && scopeIds.includes(p.scope_id) && p.seq !== undefined) {
        return p.seq
      }
    }
    return undefined
  }

  async function navigateTo(chunkId: string) {
    await applyMutation(navigateMutation(leaf, [chunkId]))
  }

  function bodyText(body: Record<string, unknown>): string | undefined {
    const t = body.text
    return typeof t === 'string' ? t : undefined
  }

  function otherBody(body: Record<string, unknown>): Array<[string, unknown]> {
    return Object.entries(body).filter(([k]) => k !== 'text')
  }
</script>

<div class="read-tile">
  <div class="scope-bar">
    {#if data}
      {#each data.scope as s (s.id)}
        <span class="pill">{s.name ?? s.id}</span>
      {/each}
    {:else}
      <span class="pill placeholder">{leaf.scope.join(' + ')}</span>
    {/if}
  </div>

  <div class="content">
    {#if loading}
      <div class="status">loading…</div>
    {:else if error}
      <div class="status error">{error}</div>
    {:else if data}
      {#if sortedItems.length === 0}
        <div class="status empty">empty scope — nothing placed here yet</div>
      {:else}
        <ul class="items">
          {#each sortedItems as item (item.id)}
            <li>
              <button type="button" class="chunk" onclick={() => navigateTo(item.id)}>
                {#if item.name}<span class="name">{item.name}</span>{/if}
                {#if bodyText(item.body)}
                  <span class="text">{bodyText(item.body)}</span>
                {/if}
                {#if otherBody(item.body).length > 0}
                  <div class="kv">
                    {#each otherBody(item.body) as [k, v] (k)}
                      <span class="pair"
                        ><span class="k">{k}</span>: <span class="v"
                          >{typeof v === 'string' ? v : JSON.stringify(v)}</span
                        ></span
                      >
                    {/each}
                  </div>
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </div>
</div>

<style>
  .read-tile {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #0a0a0a;
  }
  .scope-bar {
    display: flex;
    gap: 6px;
    padding: 6px 10px;
    border-bottom: 1px solid #1a1a1a;
    flex-shrink: 0;
  }
  .pill {
    padding: 2px 8px;
    background: #161616;
    border: 1px solid #222;
    border-radius: 3px;
    color: #c8c8c8;
    font-size: 0.8rem;
  }
  .pill.placeholder {
    color: #555;
  }
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 6px 10px;
    min-height: 0;
  }
  .status {
    color: #555;
    font-size: 0.85rem;
    padding: 8px 0;
  }
  .status.error {
    color: #c77;
  }
  .items {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .items li {
    margin: 0;
  }
  .chunk {
    display: block;
    width: 100%;
    text-align: left;
    padding: 6px 8px;
    margin-bottom: 2px;
    background: #0d0d0d;
    border: 1px solid #1a1a1a;
    border-radius: 3px;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .chunk:hover {
    border-color: #2a2a2a;
    background: #111;
  }
  .name {
    color: #d8d8d8;
    font-weight: 500;
    margin-right: 8px;
  }
  .text {
    color: #9a9a9a;
  }
  .kv {
    margin-top: 4px;
    font-size: 0.75rem;
    color: #666;
  }
  .pair {
    margin-right: 10px;
  }
  .k {
    color: #555;
  }
  .v {
    color: #888;
  }
</style>
