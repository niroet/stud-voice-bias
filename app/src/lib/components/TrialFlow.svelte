<script lang="ts">
	import PickButtons from './PickButtons.svelte';
	import Likert7 from './Likert7.svelte';
	import AudioPlayer from './AudioPlayer.svelte';
	import ProgressIndicator from './ProgressIndicator.svelte';
	import { pickAudioFile, type TrialCase, type Pick, type Voice, type TrialPhase } from '$lib/trialState';

	let {
		caseData,
		voice,
		progressLabel = '',
		onComplete,
		isPractice = false
	}: {
		caseData: TrialCase;
		voice: Voice;
		progressLabel?: string;
		onComplete: (data: TrialResult) => void;
		isPractice?: boolean;
	} = $props();

	type TrialResult = {
		initialPick: Pick;
		initialConfidence: number;
		finalPick: Pick;
		finalConfidence: number;
		audioFile: string;
		initialDecisionMs: number;
		finalDecisionMs: number;
		audioPlayedAt: Date | null;
		audioCompletedAt: Date | null;
		visibilityLost: boolean;
	};

	let phase = $state<TrialPhase>('vignette');
	let phaseStartedAt = $state(performance.now());

	let initialPick = $state<Pick | null>(null);
	let initialConfidence = $state<number | null>(null);
	let initialDecisionMs = $state(0);

	let audioFile = $state('');
	let audioPlayedAt = $state<Date | null>(null);
	let audioCompletedAt = $state<Date | null>(null);
	let visibilityLost = $state(false);
	let audioEnded = $state(false);

	let finalPick = $state<Pick | null>(null);
	let finalConfidence = $state<number | null>(null);
	let finalDecisionMs = $state(0);

	function nextPhase(p: TrialPhase) {
		phase = p;
		phaseStartedAt = performance.now();
	}

	function onInitialPick(pick: Pick, ms: number) {
		initialPick = pick;
		initialDecisionMs = ms;
		nextPhase('initialConfidence');
	}

	function onInitialConfidence(value: number) {
		initialConfidence = value;
		audioFile = pickAudioFile(caseData, voice, initialPick!);
		nextPhase('audio');
	}

	function onAudioStart(t: Date) {
		if (!audioPlayedAt) audioPlayedAt = t;
	}
	function onAudioEnded(t: Date) {
		audioCompletedAt = t;
		audioEnded = true;
	}

	function continueAfterAudio() {
		nextPhase('finalPick');
	}

	function onFinalPick(pick: Pick, ms: number) {
		finalPick = pick;
		finalDecisionMs = ms;
		nextPhase('finalConfidence');
	}

	function onFinalConfidence(value: number) {
		finalConfidence = value;
		onComplete({
			initialPick: initialPick!,
			initialConfidence: initialConfidence!,
			finalPick: finalPick!,
			finalConfidence: finalConfidence!,
			audioFile,
			initialDecisionMs,
			finalDecisionMs,
			audioPlayedAt,
			audioCompletedAt,
			visibilityLost
		});
	}

	$effect(() => {
		const handler = () => {
			if (document.hidden && phase === 'audio') visibilityLost = true;
		};
		document.addEventListener('visibilitychange', handler);
		return () => document.removeEventListener('visibilitychange', handler);
	});
</script>

{#if isPractice}
	<div class="fixed inset-x-0 top-0 z-30 border-b border-amber-300 bg-amber-100 px-4 py-2.5 text-center text-sm font-medium text-amber-900 shadow-sm">
		<span class="sm:hidden">Übungsrunde — wird nicht gespeichert</span>
		<span class="hidden sm:inline">Übungsrunde — Deine Antworten werden nicht gespeichert</span>
	</div>
{:else if phase !== 'vignette' && phase !== 'audio'}
	<ProgressIndicator label={progressLabel} />
{/if}

<div class="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-20 sm:px-6 sm:py-16">
	{#if phase === 'vignette'}
		<div>
			{#if isPractice}
				<h1 class="mb-1 text-2xl font-semibold text-slate-900">Übungsbeispiel</h1>
				<p class="mb-8 text-sm text-slate-600">Hier kannst du den Ablauf einmal durchgehen, bevor die echten Durchgänge starten.</p>
			{/if}
			<p class="mb-2 text-xs uppercase tracking-wider text-slate-500">Symptome</p>
			<p class="mb-8 break-words text-lg leading-relaxed text-slate-800">{caseData.symptoms}</p>
			<div class="flex justify-end">
				<button class="btn-primary" onclick={() => nextPhase('initialPick')}>Weiter</button>
			</div>
		</div>
	{:else if phase === 'initialPick'}
		<div>
			<p class="mb-8 text-lg font-medium">Was vermutest du?</p>
			<PickButtons
				options={{ A: caseData.optionA, B: caseData.optionB, C: caseData.optionC }}
				onConfirm={onInitialPick}
				startedAt={phaseStartedAt}
			/>
		</div>
	{:else if phase === 'initialConfidence'}
		<div>
			<p class="mb-8 text-lg font-medium">Wie sicher bist du?</p>
			<Likert7
				anchorLeft="unsicher"
				anchorRight="sehr sicher"
				onConfirm={onInitialConfidence}
				startedAt={phaseStartedAt}
			/>
		</div>
	{:else if phase === 'audio'}
		<div class="flex flex-col items-center gap-12">
			<AudioPlayer src={audioFile} onStarted={onAudioStart} onEnded={onAudioEnded} />
			{#if audioEnded}
				<button class="btn-primary" onclick={continueAfterAudio}>Weiter</button>
			{/if}
		</div>
	{:else if phase === 'finalPick'}
		<div>
			<div class="mb-6 flex max-w-full flex-col rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
				<span class="text-xs uppercase tracking-wider text-slate-500">Du hattest gewählt</span>
				<span class="break-words font-medium text-slate-800">
					{initialPick} · {initialPick === 'A' ? caseData.optionA : initialPick === 'B' ? caseData.optionB : caseData.optionC}
				</span>
			</div>
			<p class="mb-8 text-lg font-medium">Was ist deine endgültige Einschätzung?</p>
			<PickButtons
				options={{ A: caseData.optionA, B: caseData.optionB, C: caseData.optionC }}
				onConfirm={onFinalPick}
				startedAt={phaseStartedAt}
			/>
		</div>
	{:else if phase === 'finalConfidence'}
		<div>
			<p class="mb-8 text-lg font-medium">Wie sicher bist du jetzt?</p>
			<Likert7
				anchorLeft="unsicher"
				anchorRight="sehr sicher"
				onConfirm={onFinalConfidence}
				startedAt={phaseStartedAt}
			/>
		</div>
	{/if}
</div>
