<script lang="ts">
	import { goto } from '$app/navigation';
	let { data } = $props();
</script>

<svelte:head>
	<title>STUD – Experiment starten</title>
</svelte:head>

<div
	class="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center"
>
	<h1 class="text-2xl font-semibold">Übung abgeschlossen</h1>

	<div class="space-y-4 text-slate-600">
		<p>
			Super, du kennst jetzt den Ablauf! Ab jetzt beginnt das eigentliche Experiment —
			deine Antworten werden aufgezeichnet.
		</p>
		<p class="text-sm text-slate-500">
			Bitte antworte weiterhin ehrlich und so, wie du es im echten Leben tun würdest.
		</p>
	</div>

	<button class="btn-primary" onclick={() => goto(`/study/${data.sessionId}/trial/0`)}>
		Experiment starten
	</button>
</div>
