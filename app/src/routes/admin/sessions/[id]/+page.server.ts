import { db } from '$lib/server/db';
import { sessions, responses } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const session = await db.query.sessions.findFirst({ where: eq(sessions.id, params.id) });
	if (!session) error(404, 'Session fehlt');
	const sessionResponses = await db
		.select()
		.from(responses)
		.where(eq(responses.sessionId, params.id))
		.orderBy(asc(responses.block), asc(responses.position));
	return { session, responses: sessionResponses };
};
