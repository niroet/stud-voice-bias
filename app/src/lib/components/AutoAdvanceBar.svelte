<script lang="ts">
	let {
		active = false,
		durationMs = 500
	}: { active?: boolean; durationMs?: number } = $props();
</script>

<div class="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent">
	{#if active}
		<div class="h-full bg-brand-500" style="animation: bar-fill {durationMs}ms linear forwards"></div>
	{/if}
</div>

<style>
	@keyframes bar-fill {
		from { width: 0%; }
		to { width: 100%; }
	}
</style>
