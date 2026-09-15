import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const all = await db.select().from(sessions).orderBy(desc(sessions.startedAt));
	return {
		sessions: all.map((s) => ({
			id: s.id,
			blockOrder: s.blockOrder,
			startedAt: s.startedAt,
			completedAt: s.completedAt
		}))
	};
};
