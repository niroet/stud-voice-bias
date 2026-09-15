<script lang="ts">
	import TrialFlow from '$lib/components/TrialFlow.svelte';
	import type { TrialCase, Voice } from '$lib/trialState';

	let { data } = $props();

	const totalInBlock = 4;
	const positionLabel = $derived(`Block ${data.block}/2 · Trial ${data.position}/${totalInBlock}`);

	let formEl = $state<HTMLFormElement | null>(null);
	let formData = $state<Record<string, string>>({});

	function handleComplete(result: any) {
		formData = {
			caseId: data.caseData.id,
			block: String(data.block),
			voice: data.voice,
			aiCondition: data.caseData.aiCondition,
			position: String(data.position),
			initialPick: result.initialPick,
			initialConfidence: String(result.initialConfidence),
			finalPick: result.finalPick,
			finalConfidence: String(result.finalConfidence),
			audioFile: result.audioFile,
			initialDecisionMs: String(result.initialDecisionMs),
			finalDecisionMs: String(result.finalDecisionMs),
			audioPlayedAt: result.audioPlayedAt?.toISOString() ?? '',
			audioCompletedAt: result.audioCompletedAt?.toISOString() ?? '',
			visibilityLost: String(result.visibilityLost)
		};
		queueMicrotask(() => formEl?.submit());
	}
</script>

<form method="POST" bind:this={formEl} class="hidden">
	{#each Object.entries(formData) as [k, v] (k)}
		<input type="hidden" name={k} value={v} />
	{/each}
</form>

<TrialFlow
	caseData={data.caseData as TrialCase}
	voice={data.voice as Voice}
	progressLabel={positionLabel}
	onComplete={handleComplete}
/>
