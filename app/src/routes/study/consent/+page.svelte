<script lang="ts">
	import { goto } from '$app/navigation';
	let agreed = $state(false);
</script>

<svelte:head>
	<title>STUD – Einverständniserklärung</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
	<h1 class="mb-6 text-2xl font-semibold">Einverständniserklärung</h1>

	<div class="card mb-6 space-y-3 text-sm text-slate-700">
		<p>Mit Klick auf „Ich stimme zu" bestätigst du:</p>
		<ul class="list-inside list-disc space-y-2 pl-2">
			<li>Ich bin mindestens 18 Jahre alt.</li>
			<li>
				Ich nehme freiwillig teil und kann die Studie jederzeit ohne Angabe von Gründen abbrechen
				— über den „Studie abbrechen"-Link oder durch Schließen des Tabs.
			</li>
			<li>Meine Antworten in einem Trial können nach Bestätigung nicht mehr geändert werden.</li>
			<li>
				Meine Antworten werden anonym gespeichert. Es werden weder Name, E-Mail-Adresse noch
				IP-Adresse oder sonstige personenidentifizierende Daten erhoben.
			</li>
			<li>
				Die Daten werden ausschließlich anonym gespeichert und für wissenschaftliche Zwecke
				ausgewertet. Anonymisierte Datensätze können im Rahmen wissenschaftlicher
				Veröffentlichungen öffentlich zugänglich gemacht werden.
			</li>
			<li>
				Mir ist bewusst, dass eine nachträgliche Löschung meines individuellen Datensatzes
				aufgrund der vollständigen Anonymisierung nicht möglich ist. Während der laufenden
				Teilnahme kann ich den Tab jederzeit schließen. Die bis dahin erhobenen Daten verbleiben
				als unvollständige anonyme Sitzung in der Datenbank.
			</li>
			<li>
				Ich habe die <a class="text-brand-600 underline" href="/datenschutz" target="_blank"
					>Datenschutzerklärung</a
				>
				gelesen und stimme der dort beschriebenen Datenverarbeitung zu (Art. 6 Abs. 1 lit. a DSGVO).
			</li>
		</ul>
	</div>

	<label class="mb-6 flex cursor-pointer items-start gap-3">
		<input type="checkbox" bind:checked={agreed} class="mt-1" />
		<span class="text-sm text-slate-700"
			>Ich stimme der Teilnahme unter den genannten Bedingungen zu.</span
		>
	</label>

	<div class="flex items-center justify-between">
		<div class="flex gap-4 text-xs text-slate-500">
			<a href="/datenschutz" target="_blank" class="hover:text-brand-600 hover:underline"
				>Datenschutz</a
			>
			<a href="/impressum" target="_blank" class="hover:text-brand-600 hover:underline">Impressum</a>
		</div>
		<button
			class="btn-primary"
			disabled={!agreed}
			onclick={() => goto('/study/demographics')}
		>
			Weiter
		</button>
	</div>
</div>
