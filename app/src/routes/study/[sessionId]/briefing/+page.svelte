<script lang="ts">
	import { goto } from '$app/navigation';
	let { data } = $props();

	async function start() {
		try {
			await document.documentElement.requestFullscreen();
		} catch {
			// Vollbild ist optional; manche Browser verweigern es, z. B. in eingebetteten Frames.
		}
		goto(`/study/${data.sessionId}/practice`);
	}
</script>

<svelte:head>
	<title>STUD – Briefing</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
	<h1 class="mb-6 text-2xl font-semibold">Bevor es losgeht</h1>

	<div class="card mb-6 space-y-4 text-slate-700">
		<p>
			Du wirst gleich mehrere kurze medizinische Fallbeispiele sehen. Zu jedem schätzt du selbst
			eine Verdachtsdiagnose ab und hörst dann die Einschätzung der KI. Danach kannst du deine
			Antwort behalten oder ändern.
		</p>
		<p>
			Es gibt keine richtigen oder falschen Antworten — wir interessieren uns für deinen
			natürlichen Umgang mit dem Tool. Bitte antworte ehrlich und so, wie du es im echten Leben tun
			würdest.
		</p>
		<p class="text-sm text-slate-600">
			<strong>Wichtig:</strong> Bitte nutze Kopfhörer oder Lautsprecher und finde einen ruhigen Ort.
			Die Studie dauert ca. 10 Minuten.
		</p>
	</div>

	<p class="mb-6 text-sm text-slate-500">
		Wir starten mit einer kurzen <strong>Übungsrunde</strong>, damit du den Ablauf kennst.
	</p>

	<div class="flex justify-end">
		<button class="btn-primary" onclick={start}>Studie starten</button>
	</div>
</div>
