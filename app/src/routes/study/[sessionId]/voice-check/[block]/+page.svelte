<script lang="ts">
	import Likert7 from '$lib/components/Likert7.svelte';

	let { data } = $props();

	type ItemKey = 'humanness' | 'naturalness' | 'pleasantness' | 'competence' | 'trust' | 'warmth' | 'intelligibility' | 'genderedness';

	const LABELS: Record<ItemKey, string> = {
		humanness: 'Wie menschlich wirkte der KI-Assistent auf dich?',
		naturalness: 'Wie natürlich wirkte der KI-Assistent auf dich?',
		pleasantness: 'Wie angenehm fandest du den KI-Assistenten?',
		competence: 'Wie kompetent wirkte der KI-Assistent auf dich?',
		trust: 'Wie vertrauenswürdig fandest du den KI-Assistenten?',
		warmth: 'Wie warm/zugewandt wirkte der KI-Assistent auf dich?',
		intelligibility: 'Wie verständlich war der KI-Assistent?',
		genderedness: 'Wie würdest du die Stimme des KI-Assistenten einordnen?'
	};

	const ANCHORS: Record<ItemKey, [string, string]> = {
		humanness: ['sehr maschinell', 'sehr menschlich'],
		naturalness: ['sehr künstlich', 'sehr natürlich'],
		pleasantness: ['sehr unangenehm', 'sehr angenehm'],
		competence: ['sehr inkompetent', 'sehr kompetent'],
		trust: ['gar nicht vertrauenswürdig', 'sehr vertrauenswürdig'],
		warmth: ['sehr distanziert', 'sehr warm'],
		intelligibility: ['sehr unverständlich', 'sehr verständlich'],
		genderedness: ['klingt männlich', 'klingt weiblich']
	};

	let itemIndex = $state(0);
	let phaseStartedAt = $state(performance.now());

	let answers = $state<Record<string, number>>({});
	let done = $state(false);

	const currentItem = $derived(data.itemOrder[itemIndex] as ItemKey | undefined);

	function onItemAnswer(value: number) {
		answers[currentItem!] = value;

		if (itemIndex + 1 < data.itemOrder.length) {
			itemIndex += 1;
			phaseStartedAt = performance.now();
		} else {
			done = true;
			queueMicrotask(() => formEl?.submit());
		}
	}

	let formEl = $state<HTMLFormElement | null>(null);
</script>

<svelte:head>
	<title>STUD – Bewertung KI-Assistent (Block {data.block})</title>
</svelte:head>

<form method="POST" bind:this={formEl} class="hidden">
	<input type="hidden" name="answers" value={JSON.stringify(answers)} />
</form>

<div class="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
	{#if currentItem && !done}
		<div>
			<div class="mb-2 text-xs uppercase tracking-wider text-slate-500">
				Block {data.block} · Frage {itemIndex + 1}/{data.itemOrder.length}
			</div>
			<p class="mb-4 text-sm text-slate-500">
				Denk an den KI-Assistenten, den du gerade in den letzten Durchgängen gehört hast.
			</p>
			<p class="mb-8 text-lg font-medium">{LABELS[currentItem]}</p>
			{#key currentItem}
				<Likert7
					anchorLeft={ANCHORS[currentItem][0]}
					anchorRight={ANCHORS[currentItem][1]}
					onConfirm={onItemAnswer}
					startedAt={phaseStartedAt}
				/>
			{/key}
		</div>
	{/if}
</div>
