<script lang="ts">
	let { data } = $props();

	function fmtDate(d: Date | null) {
		return d ? new Date(d).toLocaleString('de-DE') : '-';
	}
</script>

<svelte:head>
	<title>STUD Admin - Dashboard</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-semibold">Dashboard</h1>

<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
	<div class="card">
		<div class="text-xs uppercase text-slate-500">Sessions Total</div>
		<div class="text-2xl font-semibold">{data.stats.sessions.total}</div>
	</div>
	<div class="card">
		<div class="text-xs uppercase text-slate-500">Completed</div>
		<div class="text-2xl font-semibold">{data.stats.sessions.completed}</div>
	</div>
	<div class="card">
		<div class="text-xs uppercase text-slate-500">Aktiv</div>
		<div class="text-2xl font-semibold">{data.stats.sessions.active}</div>
	</div>
	<div class="card">
		<div class="text-xs uppercase text-slate-500">Cases</div>
		<div class="text-2xl font-semibold">{data.stats.cases.active}/{data.stats.cases.total}</div>
		<div class="text-xs text-slate-400">Audios: {data.stats.cases.audiosReady} bereit</div>
	</div>
</div>

<div class="card">
	<h2 class="mb-4 text-lg font-semibold">Letzte 10 Sessions</h2>
	{#if data.recentSessions.length === 0}
		<p class="text-sm text-slate-500">Noch keine Sessions.</p>
	{:else}
		<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
					<th class="py-2">ID</th>
					<th class="py-2">Block-Order</th>
					<th class="py-2">Started</th>
					<th class="py-2">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each data.recentSessions as s (s.id)}
					<tr class="border-b border-slate-100">
						<td class="py-2 font-mono text-xs">
							<a href="/admin/sessions/{s.id}" class="text-brand-600 hover:underline">
								{s.id.slice(0, 8)}
							</a>
						</td>
						<td class="py-2 text-slate-600">{s.blockOrder}</td>
						<td class="py-2 text-slate-600">{fmtDate(s.startedAt)}</td>
						<td class="py-2">{s.completedAt ? 'complete' : 'aktiv'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		</div>
	{/if}
</div>
