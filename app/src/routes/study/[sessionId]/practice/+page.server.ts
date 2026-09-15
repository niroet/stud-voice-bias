import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { cases } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { practiceCondition, practiceRefuteCoinFlip } from '$lib/server/randomization';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const practice = await db.query.cases.findFirst({ where: eq(cases.id, 'practice') });
	if (!practice) error(500, 'Practice-Case fehlt, bitte bun run db:seed ausführen.');
	return {
		practiceCase: {
			...practice,
			aiCondition: practiceCondition(params.sessionId),
			refuteCoinFlip: practiceRefuteCoinFlip(params.sessionId)
		}
	};
};
