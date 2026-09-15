<script lang="ts">
	let { data } = $props();
	function fmtDate(d: Date | null) {
		return d ? new Date(d).toLocaleString('de-DE') : '-';
	}
</script>

<svelte:head>
	<title>STUD Admin - Sessions</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-semibold">Sessions ({data.sessions.length})</h1>

<div class="card overflow-x-auto">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
				<th class="py-2">ID</th>
				<th class="py-2">Block-Order</th>
				<th class="py-2">Started</th>
				<th class="py-2">Completed</th>
			</tr>
		</thead>
		<tbody>
			{#each data.sessions as s (s.id)}
				<tr class="border-b border-slate-100">
					<td class="py-2 font-mono text-xs">
						<a href="/admin/sessions/{s.id}" class="text-brand-600 hover:underline">{s.id.slice(0, 8)}</a>
					</td>
					<td class="py-2 text-slate-600">{s.blockOrder}</td>
					<td class="py-2 text-slate-600">{fmtDate(s.startedAt)}</td>
					<td class="py-2 text-slate-600">{fmtDate(s.completedAt)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
