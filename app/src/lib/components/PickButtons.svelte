<script lang="ts">
	import AutoAdvanceBar from './AutoAdvanceBar.svelte';

	type Pick = 'A' | 'B' | 'C';
	let {
		options,
		onConfirm,
		startedAt
	}: {
		options: { A: string; B: string; C: string };
		onConfirm: (pick: Pick, decisionMs: number) => void;
		startedAt: number;
	} = $props();

	let selected = $state<Pick | null>(null);
	let timer: ReturnType<typeof setTimeout> | null = null;

	function select(pick: Pick) {
		if (selected === pick) return;
		selected = pick;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			onConfirm(pick, Math.round(performance.now() - startedAt));
		}, 500);
	}
</script>

<AutoAdvanceBar active={selected !== null} />

<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
	{#each ['A', 'B', 'C'] as letter (letter)}
		{@const isSelected = selected === letter}
		<button
			type="button"
			onclick={() => select(letter as Pick)}
			class="flex min-h-[88px] min-w-0 items-start gap-3 overflow-hidden rounded-lg border-2 p-4 text-left transition-all sm:flex-col sm:items-start sm:p-5
				{isSelected
					? 'border-brand-500 bg-brand-50 text-brand-700'
					: 'border-slate-200 bg-white text-slate-900 hover:border-slate-400'}"
			aria-label="Option {letter}: {options[letter as Pick]}"
		>
			<span
				class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold
					{isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'}"
				aria-hidden="true"
			>
				{letter}
			</span>
			<span class="min-w-0 break-words text-base font-medium leading-snug hyphens-auto sm:text-lg">{options[letter as Pick]}</span>
		</button>
	{/each}
</div>
