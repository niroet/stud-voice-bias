<script lang="ts">
	let { data } = $props();
	function fmtDate(d: Date | null) {
		return d ? new Date(d).toLocaleString('de-DE') : '-';
	}
</script>

<svelte:head>
	<title>STUD Admin - Session {data.session.id.slice(0, 8)}</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-semibold">Session {data.session.id.slice(0, 8)}</h1>
	<a href="/admin/sessions" class="text-sm text-slate-500 hover:underline">zurück</a>
</div>

<div class="card mb-6">
	<dl class="grid grid-cols-2 gap-4 text-sm">
		<dt class="text-slate-500">Block-Order</dt><dd>{data.session.blockOrder}</dd>
		<dt class="text-slate-500">Started</dt><dd>{fmtDate(data.session.startedAt)}</dd>
		<dt class="text-slate-500">Completed</dt><dd>{fmtDate(data.session.completedAt)}</dd>
		<dt class="text-slate-500">Exit-Code</dt><dd>{data.session.exitCode ?? '-'}</dd>
	</dl>
</div>

<div class="card mb-6">
	<h2 class="mb-3 text-lg font-semibold">Demografie</h2>
	<pre class="overflow-x-auto rounded bg-slate-100 p-3 text-xs">{JSON.stringify(data.session.demographics, null, 2)}</pre>
</div>

<div class="card mb-6 overflow-x-auto">
	<h2 class="mb-3 text-lg font-semibold">Responses ({data.responses.length})</h2>
	<table class="w-full min-w-[640px] text-xs">
		<thead>
			<tr class="border-b text-left text-slate-500">
				<th class="py-1">B/P</th>
				<th class="py-1">Voice</th>
				<th class="py-1">KI</th>
				<th class="py-1">Case</th>
				<th class="py-1">Pick i/f</th>
				<th class="py-1">Konf i/f</th>
				<th class="py-1">Shift</th>
				<th class="py-1">RT i/f (ms)</th>
				<th class="py-1">Tab verlassen</th>
			</tr>
		</thead>
		<tbody>
			{#each data.responses as r (r.id)}
				<tr class="border-b border-slate-100">
					<td class="py-1">{r.block}/{r.position}</td>
					<td class="py-1">{r.voice}</td>
					<td class="py-1">{r.aiCondition}</td>
					<td class="py-1 font-mono">{r.caseId}</td>
					<td class="py-1">{r.initialPick}/{r.finalPick}</td>
					<td class="py-1">{r.initialConfidence}/{r.finalConfidence}</td>
					<td class="py-1 font-medium">{r.finalConfidence - r.initialConfidence > 0 ? '+' : ''}{r.finalConfidence - r.initialConfidence}</td>
					<td class="py-1 text-slate-500">{r.initialDecisionMs}/{r.finalDecisionMs}</td>
					<td class="py-1">{r.visibilityLost ? 'ja' : ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="card">
	<h2 class="mb-3 text-lg font-semibold">Voice-Perception</h2>
	<pre class="overflow-x-auto rounded bg-slate-100 p-3 text-xs">{JSON.stringify(data.session.voicePerception, null, 2)}</pre>
</div>
