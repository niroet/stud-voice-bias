import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, url }) => {
	const session = await db.query.sessions.findFirst({
		where: eq(sessions.id, params.sessionId)
	});
	if (!session) error(404, 'Session nicht gefunden');
	if (session.completedAt && !url.pathname.endsWith('/debrief')) {
		error(410, 'Session bereits abgeschlossen');
	}
	return {
		sessionId: session.id,
		blockOrder: session.blockOrder
	};
};
