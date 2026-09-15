<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>STUD – Studie zu KI-Symptom-Checkern</title>
</svelte:head>

<div class="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16">
	<h1 class="text-center text-2xl font-semibold sm:text-3xl">Studie zu KI-Symptom-Checkern</h1>
	<p class="text-center text-slate-600">
		Vielen Dank für dein Interesse. Diese Studie untersucht, wie Menschen mit KI-gestützten
		Symptom-Checkern interagieren. Die Teilnahme dauert ca. 10 Minuten.
	</p>
	<button type="button" class="btn-primary" onclick={() => goto('/study/consent')}>Teilnehmen</button>
</div>
