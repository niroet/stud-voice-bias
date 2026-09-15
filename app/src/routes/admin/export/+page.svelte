<svelte:head>
	<title>STUD Admin - Export</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-semibold">CSV-Export</h1>

<div class="card space-y-4">
	<div>
		<h2 class="font-semibold">Long-Format</h2>
		<p class="mb-2 text-sm text-slate-500">Eine Zeile pro Response. Empfohlen für R/JASP/Mixed-Models.</p>
		<a href="/api/admin/export?format=long" download="stud_long.csv" class="btn-primary">Download long.csv</a>
	</div>
	<div>
		<h2 class="font-semibold">Wide-Format</h2>
		<p class="mb-2 text-sm text-slate-500">Eine Zeile pro Session. Empfohlen für SPSS/JASP-ANOVA.</p>
		<a href="/api/admin/export?format=wide" download="stud_wide.csv" class="btn-primary">Download wide.csv</a>
	</div>
</div>
