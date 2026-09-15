<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<svelte:head>
	<title>STUD Admin - Login</title>
</svelte:head>

<div class="mx-auto mt-12 max-w-sm px-4 sm:mt-24">
	<h1 class="mb-6 text-2xl font-semibold">Admin-Login</h1>
	<form method="POST" use:enhance class="card space-y-4">
		<div>
			<label class="label" for="password">Passwort</label>
			<!-- svelte-ignore a11y_autofocus -->
			<input id="password" name="password" type="password" class="input mt-1" autofocus />
		</div>
		{#if form?.error}
			<p class="text-sm text-red-600">{form.error}</p>
		{/if}
		<button class="btn-primary w-full">Einloggen</button>
	</form>
</div>
