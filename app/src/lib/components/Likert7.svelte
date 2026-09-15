<script lang="ts">
	import AutoAdvanceBar from './AutoAdvanceBar.svelte';

	let {
		anchorLeft,
		anchorRight,
		onConfirm,
		startedAt
	}: {
		anchorLeft: string;
		anchorRight: string;
		onConfirm: (value: number, decisionMs: number) => void;
		startedAt: number;
	} = $props();

	let selected = $state<number | null>(null);
	let timer: ReturnType<typeof setTimeout> | null = null;

	function select(value: number) {
		if (selected === value) return;
		selected = value;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			onConfirm(value, Math.round(performance.now() - startedAt));
		}, 500);
	}
</script>

<AutoAdvanceBar active={selected !== null} />

<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
	<span class="break-words text-sm text-slate-500 sm:max-w-[180px] sm:flex-shrink">{anchorLeft}</span>
	<div class="flex flex-1 items-center justify-between gap-1 sm:justify-center sm:gap-2">
		{#each [1, 2, 3, 4, 5, 6, 7] as n (n)}
			{@const isSelected = selected === n}
			<button
				type="button"
				onclick={() => select(n)}
				aria-label="Wert {n} von 7 (links: {anchorLeft}, rechts: {anchorRight})"
				class="h-11 w-11 flex-shrink-0 rounded-full border-2 transition-all sm:h-12 sm:w-12
					{isSelected
						? 'border-brand-500 bg-brand-500'
						: 'border-slate-300 bg-white hover:border-slate-400'}
					{n === 4 ? 'relative' : ''}"
			>
				{#if n === 4 && !isSelected}
					<span class="absolute inset-x-0 -bottom-3 text-[10px] text-slate-400">·</span>
				{/if}
			</button>
		{/each}
	</div>
	<span class="break-words text-right text-sm text-slate-500 sm:max-w-[180px] sm:flex-shrink">{anchorRight}</span>
</div>
