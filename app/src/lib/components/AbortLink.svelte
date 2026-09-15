<script lang="ts">
	import { goto } from '$app/navigation';
	import { audioActive } from '$lib/audioContext';

	let { sessionId }: { sessionId?: string } = $props();
	let confirming = $state(false);
</script>

{#if !$audioActive}
	<button
		type="button"
		onclick={() => (confirming = true)}
		class="fixed right-4 top-4 z-30 rounded-md px-2 py-1 text-xs text-slate-500 underline decoration-slate-400 underline-offset-2 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
	>
		× Studie abbrechen
	</button>
{/if}

{#if confirming}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
		<div class="card w-full max-w-md">
			<h3 class="mb-2 text-lg font-semibold">Studie wirklich abbrechen?</h3>
			<p class="mb-4 text-sm text-slate-600">
				Deine bisherigen Antworten werden vollständig gelöscht. Du kannst die Studie später nicht
				fortsetzen.
			</p>
			<div class="flex flex-col-reverse justify-end gap-2 sm:flex-row">
				<button type="button" class="btn-secondary" onclick={() => (confirming = false)}>
					Doch weitermachen
				</button>
				<button
					type="button"
					class="btn-primary"
					onclick={async () => {
						if (sessionId) {
							await fetch('/api/abort', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ sessionId })
							});
						}
						goto('/study/aborted');
					}}
				>
					Ja, abbrechen
				</button>
			</div>
		</div>
	</div>
{/if}
