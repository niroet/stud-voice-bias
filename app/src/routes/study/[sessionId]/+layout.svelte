<script lang="ts">
	import AbortLink from '$lib/components/AbortLink.svelte';

	let { data, children } = $props();
</script>

<AbortLink sessionId={data.sessionId} />

{@render children()}
