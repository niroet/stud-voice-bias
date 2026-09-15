<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { audioActive } from '$lib/audioContext';

	let {
		src,
		onEnded,
		onStarted,
		autoplay = true,
		label = 'Die KI-Diagnose',
		startCue = 'Klicke zum Anhören'
	}: {
		src: string;
		onEnded: (completedAt: Date) => void;
		onStarted?: (playedAt: Date) => void;
		autoplay?: boolean;
		label?: string;
		startCue?: string;
	} = $props();

	let audio = $state<HTMLAudioElement | null>(null);
	let progress = $state(0);
	let ended = $state(false);
	let started = $state(false);
	let showResumeModal = $state(false);

	onMount(() => {
		if (audio && autoplay) {
			audio.play().catch((e) => {
				console.error('Autoplay fehlgeschlagen', e);
			});
		}
		document.addEventListener('visibilitychange', handleVisibility);
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('visibilitychange', handleVisibility);
		}
		audioActive.set(false);
	});

	function handleVisibility() {
		if (document.hidden && audio && !audio.paused && !ended) {
			audio.pause();
			showResumeModal = true;
		}
	}

	function handleTimeUpdate() {
		if (!audio) return;
		progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;
	}

	function handleStart() {
		if (!started) {
			started = true;
			audioActive.set(true);
			onStarted?.(new Date());
		}
	}

	function handleEnded() {
		if (!ended) {
			ended = true;
			progress = 100;
			audioActive.set(false);
			onEnded(new Date());
		}
	}

	function play() {
		if (!audio) return;
		audio.play();
	}

	function replay() {
		if (!audio) return;
		audio.currentTime = 0;
		ended = false;
		progress = 0;
		audio.play();
	}

	function resumeAfterVisibility() {
		showResumeModal = false;
		replay();
	}

	function dismissResumeModal() {
		showResumeModal = false;
		if (!ended) {
			ended = true;
			audioActive.set(false);
			onEnded(new Date());
		}
	}
</script>

<div class="flex flex-col items-center gap-6">
	<audio
		bind:this={audio}
		{src}
		preload="auto"
		onplay={handleStart}
		ontimeupdate={handleTimeUpdate}
		onended={handleEnded}
	></audio>

	{#if !started && !autoplay}
		<button
			type="button"
			onclick={play}
			class="btn-primary inline-flex items-center gap-2"
			aria-label="Audio starten"
		>
			<span aria-hidden="true">▶</span>
			<span>{startCue}</span>
		</button>
	{:else if !ended}
		<p class="text-lg text-slate-700">{label}</p>
		<div class="h-1 w-64 overflow-hidden rounded-full bg-slate-200">
			<div class="h-full bg-brand-500 transition-[width] duration-100" style="width: {progress}%"></div>
		</div>
	{:else}
		<button type="button" onclick={replay} class="btn-secondary inline-flex items-center gap-2">
			<span aria-hidden="true">▶</span>
			<span>Nochmal hören</span>
		</button>
	{/if}
</div>

{#if showResumeModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
		<div class="card max-w-md">
			<h3 class="mb-2 text-lg font-semibold">Audio pausiert</h3>
			<p class="mb-4 text-sm text-slate-600">
				Du hast den Tab verlassen. Möchtest du das Audio nochmal von Anfang hören?
			</p>
			<div class="flex justify-end gap-2">
				<button type="button" class="btn-secondary" onclick={dismissResumeModal}>Nein, weiter</button>
				<button type="button" class="btn-primary" onclick={resumeAfterVisibility}>Ja, neu starten</button>
			</div>
		</div>
	</div>
{/if}
