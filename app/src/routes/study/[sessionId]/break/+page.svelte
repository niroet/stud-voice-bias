<script lang="ts">
	import { goto } from '$app/navigation';
	let { data } = $props();
</script>

<div class="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-8 px-6 text-center">
	<h1 class="text-2xl font-semibold">Block 1 abgeschlossen.</h1>
	<p class="text-slate-600">
		Du hast den ersten Teil geschafft. Atme kurz durch — kein Zeitlimit.
	</p>
	<button class="btn-primary" onclick={() => goto(`/study/${data.sessionId}/trial/4`)}>
		Weiter zu Block 2
	</button>
</div>
