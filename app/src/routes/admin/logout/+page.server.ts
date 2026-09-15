import { redirect } from '@sveltejs/kit';
import { ADMIN_COOKIE_NAME } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete(ADMIN_COOKIE_NAME, { path: '/' });
		redirect(303, '/admin/login');
	}
};
