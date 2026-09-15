<script lang="ts">
	let { label }: { label: string } = $props();
</script>

<div class="fixed left-4 top-4 z-30 rounded-full bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-500 shadow-sm ring-1 ring-slate-200 backdrop-blur">
	{label}
</div>
