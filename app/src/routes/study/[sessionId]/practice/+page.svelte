<script lang="ts">
	import { goto } from '$app/navigation';
	import TrialFlow from '$lib/components/TrialFlow.svelte';
	import type { TrialCase, Voice } from '$lib/trialState';

	let { data } = $props();

	// Übung mit der Stimme von Block 1
	const practiceVoice: Voice = $derived(data.blockOrder === 'anthro_first' ? 'anthropomorphic' : 'machine');

	function onComplete() {
		// Übungsantworten werden nicht gespeichert.
		goto(`/study/${data.sessionId}/start`);
	}
</script>

<TrialFlow
	caseData={data.practiceCase as TrialCase}
	voice={practiceVoice}
	progressLabel="Übungsrunde"
	isPractice={true}
	{onComplete}
/>
