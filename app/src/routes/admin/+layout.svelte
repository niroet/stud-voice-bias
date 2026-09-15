<script lang="ts">
	import { page } from '$app/state';
	let { children } = $props();

	const showNav = $derived(page.url.pathname !== '/admin/login');

	const navItems = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/sessions', label: 'Sessions' },
		{ href: '/admin/export', label: 'Export' }
	];
</script>

{#if showNav}
	<a
		href="#main-content"
		class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-brand-500 focus:px-3 focus:py-2 focus:text-white"
	>
		Zum Hauptinhalt springen
	</a>
	<header class="border-b border-slate-200 bg-white">
		<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
			<div class="font-semibold text-slate-900">STUD Admin</div>
			<nav class="flex flex-wrap gap-x-4 gap-y-2 text-sm">
				{#each navItems as item (item.href)}
					{@const active = page.url.pathname === item.href || (item.href !== '/admin' && page.url.pathname.startsWith(item.href))}
					<a
						href={item.href}
						class="text-slate-600 hover:text-slate-900 {active ? 'font-semibold text-slate-900' : ''}"
					>
						{item.label}
					</a>
				{/each}
				<form method="POST" action="/admin/logout" class="inline">
					<button class="text-slate-500 hover:text-slate-700">Logout</button>
				</form>
			</nav>
		</div>
	</header>
{/if}

<main id="main-content" class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
	{@render children()}
</main>
