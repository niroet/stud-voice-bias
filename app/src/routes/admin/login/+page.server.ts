import { fail, redirect } from '@sveltejs/kit';
import { checkPassword, makeAdminCookie } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = (data.get('password') as string) ?? '';
		if (!checkPassword(password)) {
			return fail(401, { error: 'Falsches Passwort' });
		}
		const c = makeAdminCookie();
		cookies.set(c.name, c.value, c.opts);
		redirect(303, '/admin');
	}
};
