<script>
  import ScopeView from '$lib/components/ScopeView.svelte'

  let { data } = $props()
</script>

<svelte:head>
  <title>{data.scopeChunks.map((s) => s.name ?? s.id).join(' + ')} - reader</title>
</svelte:head>

<div class="reader">
  <ScopeView {data} />
</div>

<style>
  .reader {
    width: 100vw;
    height: 100vh;
  }
</style>
