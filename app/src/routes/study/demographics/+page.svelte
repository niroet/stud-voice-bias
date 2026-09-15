<script lang="ts">
	import { enhance } from '$app/forms';

	let age = $state('');
	let gender = $state('');
	let experienceSymptomCheckers = $state<number | null>(null);
	let experienceVoiceAi = $state<number | null>(null);

	let submitting = $state(false);

	const valid = $derived(
		age !== '' && gender !== '' && experienceSymptomCheckers !== null && experienceVoiceAi !== null
	);
</script>

<svelte:head>
	<title>STUD – Demografie</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
	<h1 class="mb-6 text-2xl font-semibold">Ein paar Fragen zu dir</h1>

	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
		class="space-y-8"
	>
		<div>
			<label class="label" for="age">Alter</label>
			<select id="age" name="age" bind:value={age} class="input mt-1">
				<option value="">— bitte wählen —</option>
				<option>18–24</option>
				<option>25–34</option>
				<option>35–44</option>
				<option>45–54</option>
				<option>55+</option>
			</select>
		</div>

		<div>
			<label class="label" for="gender">Geschlecht</label>
			<select id="gender" name="gender" bind:value={gender} class="input mt-1">
				<option value="">— bitte wählen —</option>
				<option>weiblich</option>
				<option>männlich</option>
				<option>divers</option>
				<option>keine Angabe</option>
			</select>
		</div>

		<div>
			<p class="label mb-2">Wie häufig nutzt du KI-Symptom-Checker (z.B. ChatGPT, Ada)?</p>
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
				<span class="text-xs text-slate-500">nie</span>
				<div class="flex flex-1 items-center justify-between gap-1 sm:justify-center sm:gap-2">
					{#each [1, 2, 3, 4, 5, 6, 7] as n (n)}
						<button
							type="button"
							aria-label="Wert {n} von 7"
							onclick={() => (experienceSymptomCheckers = n)}
							class="h-11 w-11 flex-shrink-0 rounded-full border-2 transition
								{experienceSymptomCheckers === n
									? 'border-brand-500 bg-brand-500'
									: 'border-slate-300 bg-white hover:border-slate-400'}"
						></button>
					{/each}
				</div>
				<span class="text-right text-xs text-slate-500">täglich</span>
			</div>
			<input type="hidden" name="experienceSymptomCheckers" value={experienceSymptomCheckers ?? ''} />
		</div>

		<div>
			<p class="label mb-2">Wie viel Erfahrung hast du mit KI-Sprachassistenten (Alexa, Siri, ChatGPT-Voice)?</p>
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
				<span class="text-xs text-slate-500">keine</span>
				<div class="flex flex-1 items-center justify-between gap-1 sm:justify-center sm:gap-2">
					{#each [1, 2, 3, 4, 5, 6, 7] as n (n)}
						<button
							type="button"
							aria-label="Wert {n} von 7"
							onclick={() => (experienceVoiceAi = n)}
							class="h-11 w-11 flex-shrink-0 rounded-full border-2 transition
								{experienceVoiceAi === n
									? 'border-brand-500 bg-brand-500'
									: 'border-slate-300 bg-white hover:border-slate-400'}"
						></button>
					{/each}
				</div>
				<span class="text-right text-xs text-slate-500">sehr viel</span>
			</div>
			<input type="hidden" name="experienceVoiceAi" value={experienceVoiceAi ?? ''} />
		</div>

		<div class="flex justify-end">
			<button class="btn-primary" disabled={!valid || submitting}>Weiter</button>
		</div>
	</form>
</div>
