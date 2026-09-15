import type { Handle } from '@sveltejs/kit';
import { isAdminCookieValid, ADMIN_COOKIE_NAME } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const cookie = event.cookies.get(ADMIN_COOKIE_NAME);
	event.locals.isAdmin = isAdminCookieValid(cookie);

	const path = event.url.pathname;
	if (path.startsWith('/admin') && path !== '/admin/login' && !event.locals.isAdmin) {
		redirect(303, '/admin/login');
	}
	if (path.startsWith('/api/admin') && !event.locals.isAdmin) {
		return new Response('Unauthorized', { status: 401 });
	}

	return resolve(event);
};
