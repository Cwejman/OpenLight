<script lang="ts">
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import type { ReaderData } from '../../routes/reader/+page.server.ts'

  let { data }: { data: ReaderData } = $props()

  // --- State ---
  let hoveredItem: string | null = $state(null)
  let mouseX = $state(0)
  let mouseY = $state(0)
  let containerEl: HTMLDivElement | undefined = $state()
  let canvasEl: HTMLCanvasElement | undefined = $state()
  let itemEls = $state<Map<string, HTMLElement>>(new Map())

  // --- Derived ---
  let isOrdered = $derived(data.scopeChunks.some((s) => s.spec.ordered))
  let acceptedTypes = $derived(
    data.scopeChunks.flatMap((s) => s.spec.accepts ?? [])
  )
  // Items grouped by their instance placement type
  let instanceItems = $derived(
    data.items.filter((i) => i.instanceScopes.length > 0)
  )
  let relatesItems = $derived(
    data.items.filter(
      (i) => i.relatesScopes.length > 0 && i.instanceScopes.length === 0
    )
  )

  // Items that share a relates connection with the hovered item
  let highlightedItems = $derived.by(() => {
    if (!hoveredItem) return new Set<string>()
    const hovered = data.items.find((i) => i.id === hoveredItem)
    if (!hovered) return new Set<string>()

    // Find all items that share a relates scope with this item
    const hoveredRelates = new Set(
      hovered.relatesScopes
    )
    const result = new Set<string>()
    for (const item of data.items) {
      if (item.id === hoveredItem) continue
      for (const s of item.relatesScopes) {
        if (hoveredRelates.has(s)) {
          result.add(item.id)
          break
        }
      }
    }
    return result
  })

  // --- Navigation ---
  function navigateToScope(scopeId: string) {
    goto(`/reader?scope=${encodeURIComponent(scopeId)}`)
  }

  function navigateToItem(itemId: string) {
    goto(`/reader?scope=${encodeURIComponent(itemId)}`)
  }

  // --- Element ref tracking via use: action ---
  function trackEl(el: HTMLElement, id: string) {
    itemEls.set(id, el)
    return {
      destroy() {
        itemEls.delete(id)
      },
    }
  }

  // --- WebGL ---
  let gl: WebGLRenderingContext | null = null
  let program: WebGLProgram | null = null
  let animFrameId: number | null = null

  const VERT_SRC = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `

  const FRAG_SRC = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform int u_count;
    uniform vec4 u_items[64];   // xy = position, z = radius, w = dimIndex
    uniform vec3 u_colors[16];  // per-dimension hue
    uniform int u_highlighted[64]; // 1 if highlighted, 0 if not

    // WebGL1 requires const index for arrays — use loop to look up color
    vec3 getColor(int idx) {
      vec3 c = vec3(0.3, 0.3, 0.4);
      for (int j = 0; j < 16; j++) {
        if (j == idx) { c = u_colors[j]; break; }
      }
      return c;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy;
      float field = 0.0;
      vec3 color = vec3(0.0);

      for (int i = 0; i < 64; i++) {
        if (i >= u_count) break;
        vec2 pos = u_items[i].xy;
        float radius = u_items[i].z;
        int dimIdx = int(u_items[i].w);
        float d = distance(uv, pos);
        float influence = radius / max(d, 1.0);
        influence = influence * influence;

        // Boost highlighted items
        float boost = 1.0;
        if (u_highlighted[i] == 1) {
          boost = 2.5;
        }

        field += influence * boost;
        vec3 itemColor = getColor(dimIdx);
        color += itemColor * influence * boost;
      }

      // Mouse field disturbance
      float mouseDist = distance(uv, u_mouse);
      float mouseInfluence = 30.0 / max(mouseDist, 1.0);
      mouseInfluence = mouseInfluence * mouseInfluence * 0.3;
      field += mouseInfluence;
      color += vec3(0.15, 0.12, 0.2) * mouseInfluence;

      // Normalize color
      if (field > 0.0) {
        color /= field;
      }

      // Smooth falloff - very subtle
      float alpha = smoothstep(0.0, 0.8, field) * 0.12;

      // Background
      vec3 bg = vec3(0.039, 0.039, 0.039); // #0a0a0a
      vec3 final_color = mix(bg, color, alpha);

      gl_FragColor = vec4(final_color, 1.0);
    }
  `

  function initWebGL() {
    if (!canvasEl) return
    gl = canvasEl.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) return

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vs, VERT_SRC)
    gl.compileShader(vs)

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fs, FRAG_SRC)
    gl.compileShader(fs)

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(fs))
      return
    }

    program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Fullscreen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    const loc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  }

  // Dimension color palette - muted, dark tones
  const DIM_COLORS: [number, number, number][] = [
    [0.25, 0.15, 0.35],  // purple
    [0.15, 0.25, 0.35],  // blue
    [0.15, 0.35, 0.25],  // green
    [0.35, 0.25, 0.15],  // amber
    [0.35, 0.15, 0.25],  // rose
    [0.25, 0.35, 0.15],  // lime
    [0.15, 0.35, 0.35],  // teal
    [0.35, 0.15, 0.35],  // magenta
    [0.3, 0.3, 0.15],    // gold
    [0.15, 0.2, 0.35],   // indigo
    [0.35, 0.2, 0.15],   // orange
    [0.2, 0.35, 0.3],    // mint
    [0.3, 0.15, 0.15],   // red
    [0.15, 0.3, 0.2],    // emerald
    [0.25, 0.2, 0.35],   // violet
    [0.35, 0.3, 0.2],    // tan
  ]

  function renderFrame(time: number) {
    if (!gl || !program || !canvasEl || !containerEl) {
      animFrameId = requestAnimationFrame(renderFrame)
      return
    }

    const dpr = window.devicePixelRatio || 1
    const rect = containerEl.getBoundingClientRect()
    const w = Math.round(rect.width * dpr)
    const h = Math.round(rect.height * dpr)

    if (canvasEl.width !== w || canvasEl.height !== h) {
      canvasEl.width = w
      canvasEl.height = h
      gl.viewport(0, 0, w, h)
    }

    gl.useProgram(program)

    // Resolution
    const resLoc = gl.getUniformLocation(program, 'u_resolution')
    gl.uniform2f(resLoc, w, h)

    // Time
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    gl.uniform1f(timeLoc, time * 0.001)

    // Mouse (in canvas pixel coords)
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse')
    const mx = (mouseX - rect.left) * dpr
    const my = (rect.height - (mouseY - rect.top)) * dpr  // flip Y for GL
    gl.uniform2f(mouseLoc, mx, my)

    // Build connected scope -> dimension index map
    const dimMap = new Map<string, number>()
    for (let i = 0; i < data.connected.length && i < 16; i++) {
      dimMap.set(data.connected[i].id, i)
    }

    // Pack item positions from DOM
    const positions: number[] = []
    const highlightedArr: number[] = []
    let count = 0

    for (const item of data.items) {
      if (count >= 64) break
      const el = itemEls.get(item.id)
      if (!el) continue

      const elRect = el.getBoundingClientRect()
      const cx = (elRect.left + elRect.width / 2 - rect.left) * dpr
      const cy = (rect.height - (elRect.top + elRect.height / 2 - rect.top)) * dpr

      // Determine dimension index from connected scopes
      let dimIdx = -1
      for (const p of item.instanceScopes) {
        if (!data.scopeIds.includes(p) && dimMap.has(p)) {
          dimIdx = dimMap.get(p)!
          break
        }
      }
      if (dimIdx === -1) {
        for (const p of item.relatesScopes) {
          if (!data.scopeIds.includes(p) && dimMap.has(p)) {
            dimIdx = dimMap.get(p)!
            break
          }
        }
      }

      const radius = Math.max(elRect.width, elRect.height) * dpr * 0.8

      positions.push(cx, cy, radius, dimIdx)
      highlightedArr.push(highlightedItems.has(item.id) || item.id === hoveredItem ? 1 : 0)
      count++
    }

    // Set uniforms
    const countLoc = gl.getUniformLocation(program, 'u_count')
    gl.uniform1i(countLoc, count)

    // Items as vec4 array
    for (let i = 0; i < count; i++) {
      const loc = gl.getUniformLocation(program, `u_items[${i}]`)
      gl.uniform4f(loc, positions[i * 4], positions[i * 4 + 1], positions[i * 4 + 2], positions[i * 4 + 3])
    }

    // Highlighted
    for (let i = 0; i < count; i++) {
      const loc = gl.getUniformLocation(program, `u_highlighted[${i}]`)
      gl.uniform1i(loc, highlightedArr[i])
    }

    // Colors
    for (let i = 0; i < 16; i++) {
      const loc = gl.getUniformLocation(program, `u_colors[${i}]`)
      const c = DIM_COLORS[i]
      gl.uniform3f(loc, c[0], c[1], c[2])
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    animFrameId = requestAnimationFrame(renderFrame)
  }

  function handleMouseMove(e: MouseEvent) {
    mouseX = e.clientX
    mouseY = e.clientY
  }

  // --- Lifecycle ---
  $effect(() => {
    if (!browser) return
    initWebGL()
    animFrameId = requestAnimationFrame(renderFrame)
    return () => {
      if (animFrameId !== null) cancelAnimationFrame(animFrameId)
      if (gl) {
        const ext = gl.getExtension('WEBGL_lose_context')
        if (ext) ext.loseContext()
      }
    }
  })
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="scope-view"
  bind:this={containerEl}
  onmousemove={handleMouseMove}
>
  <!-- WebGL canvas behind everything -->
  <canvas
    bind:this={canvasEl}
    class="field-canvas"
  ></canvas>

  <!-- DOM layer -->
  <div class="dom-layer">
    <!-- Breadcrumb -->
    <div class="breadcrumb">
      {#each data.scopeChunks as sc, i}
        {#if i > 0}<span class="sep">/</span>{/if}
        <span class="scope-name">{sc.name ?? sc.id}</span>
      {/each}
      <span class="counts">
        {data.counts.in_scope} items
        {#if data.counts.instance > 0}
          <span class="count-detail">{data.counts.instance} instance</span>
        {/if}
        {#if data.counts.relates > 0}
          <span class="count-detail">{data.counts.relates} relates</span>
        {/if}
      </span>
    </div>

    <!-- Connected scopes nav -->
    {#if data.connected.length > 0}
      <nav class="connected-scopes">
        {#each data.connected as cs}
          <button
            class="connected-scope"
            onclick={() => navigateToScope(cs.id)}
          >
            <span class="cs-name">{cs.name ?? cs.id}</span>
            <span class="cs-counts">
              {#if cs.instance > 0}<span class="cs-inst">{cs.instance}i</span>{/if}
              {#if cs.relates > 0}<span class="cs-rel">{cs.relates}r</span>{/if}
            </span>
          </button>
        {/each}
      </nav>
    {/if}

    <!-- Items -->
    {#if data.items.length === 0}
      <div class="empty-state">
        <span class="empty-label">empty scope</span>
        {#if acceptedTypes.length > 0}
          <span class="empty-accepts">accepts: {acceptedTypes.join(', ')}</span>
        {/if}
        {#if data.scopeChunks.some((s) => s.spec.ordered)}
          <span class="empty-spec">ordered</span>
        {/if}
      </div>
    {:else}
      <div class="items-container" class:ordered={isOrdered}>
        <!-- Instance items -->
        {#each instanceItems as item (item.id)}
          <button
            class="item instance"
            class:hovered={hoveredItem === item.id}
            class:highlighted={highlightedItems.has(item.id)}
            use:trackEl={item.id}
            onclick={() => navigateToItem(item.id)}
            onmouseenter={() => { hoveredItem = item.id }}
            onmouseleave={() => { hoveredItem = null }}
          >
            <span class="item-name">{item.name ?? item.id}</span>
            {#if isOrdered && item.seq !== undefined}
              <span class="item-seq">{item.seq}</span>
            {/if}
          </button>
        {/each}

        <!-- Relates-only items (secondary) -->
        {#if relatesItems.length > 0}
          <div class="relates-divider"></div>
          {#each relatesItems as item (item.id)}
            <button
              class="item relates"
              class:hovered={hoveredItem === item.id}
              class:highlighted={highlightedItems.has(item.id)}
              use:trackEl={item.id}
              onclick={() => navigateToItem(item.id)}
              onmouseenter={() => { hoveredItem = item.id }}
              onmouseleave={() => { hoveredItem = null }}
            >
              <span class="item-name">{item.name ?? item.id}</span>
            </button>
          {/each}
        {/if}

        <!-- Ghost slots for accepted types not yet placed -->
        {#each acceptedTypes as typeName}
          <div class="ghost-slot">
            <span class="ghost-label">{typeName}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .scope-view {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #0a0a0a;
  }

  .field-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .dom-layer {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 16px;
    gap: 8px;
  }

  /* Breadcrumb */
  .breadcrumb {
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex-shrink: 0;
  }
  .scope-name {
    color: #666;
    font-size: 0.85rem;
  }
  .sep {
    color: #333;
    font-size: 0.75rem;
  }
  .counts {
    color: #444;
    font-size: 0.7rem;
    margin-left: auto;
  }
  .count-detail {
    color: #383838;
    margin-left: 4px;
  }

  /* Connected scopes nav */
  .connected-scopes {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex-shrink: 0;
  }
  .connected-scope {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: transparent;
    border: 1px solid #1a1a1a;
    border-radius: 3px;
    color: #555;
    font-size: 0.75rem;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .connected-scope:hover {
    border-color: #333;
    color: #888;
  }
  .cs-name {
    /* inherits */
  }
  .cs-counts {
    color: #383838;
    font-size: 0.65rem;
  }
  .cs-inst {
    color: #4a4a4a;
  }
  .cs-rel {
    color: #3a3a4a;
  }

  /* Items container */
  .items-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-content: flex-start;
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }
  .items-container.ordered {
    flex-direction: column;
    flex-wrap: nowrap;
  }

  /* Item buttons */
  .item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: transparent;
    border: 1px solid #1a1a1a;
    border-radius: 3px;
    color: #888;
    font-size: 0.8rem;
    font-family: inherit;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }
  .item:hover,
  .item.hovered {
    color: #c8c8c8;
    border-color: #333;
  }
  .item.highlighted {
    border-color: #2a2a3a;
    color: #aaa;
    background: rgba(40, 40, 60, 0.15);
  }
  .item.relates {
    border-style: dashed;
    color: #666;
  }
  .item.relates:hover,
  .item.relates.hovered {
    color: #aaa;
    border-color: #333;
  }

  .item-name {
    /* inherits */
  }
  .item-seq {
    color: #444;
    font-size: 0.65rem;
  }

  /* Ghost slots */
  .ghost-slot {
    padding: 5px 10px;
    border: 1px dashed #151515;
    border-radius: 3px;
  }
  .ghost-label {
    color: #2a2a2a;
    font-size: 0.75rem;
    font-style: italic;
  }

  /* Relates divider */
  .relates-divider {
    width: 100%;
    height: 1px;
    background: #151515;
    margin: 4px 0;
  }

  /* Empty state */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .empty-label {
    color: #333;
    font-size: 0.9rem;
  }
  .empty-accepts {
    color: #2a2a2a;
    font-size: 0.75rem;
  }
  .empty-spec {
    color: #222;
    font-size: 0.7rem;
    font-style: italic;
  }

  /* Scrollbar */
  .items-container::-webkit-scrollbar {
    width: 4px;
  }
  .items-container::-webkit-scrollbar-track {
    background: transparent;
  }
  .items-container::-webkit-scrollbar-thumb {
    background: #1a1a1a;
    border-radius: 2px;
  }
</style>
