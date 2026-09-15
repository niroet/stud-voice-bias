import { db } from '$lib/server/db';
import { cases, sessions } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allCases = await db.select().from(cases);
	const activeCount = allCases.filter((c) => c.active).length;
	const audiosReady = allCases.filter(
		(c) =>
			c.audios.anthropomorphic.A &&
			c.audios.anthropomorphic.B &&
			c.audios.anthropomorphic.C &&
			c.audios.machine.A &&
			c.audios.machine.B &&
			c.audios.machine.C
	).length;

	const allSessions = await db.select().from(sessions);
	const completed = allSessions.filter((s) => s.completedAt).length;
	const active = allSessions.filter((s) => !s.completedAt).length;

	return {
		stats: {
			cases: { total: allCases.length, active: activeCount, audiosReady },
			sessions: { total: allSessions.length, completed, active }
		},
		recentSessions: allSessions
			.sort((a, b) => +b.startedAt - +a.startedAt)
			.slice(0, 10)
			.map((s) => ({
				id: s.id,
				blockOrder: s.blockOrder,
				startedAt: s.startedAt,
				completedAt: s.completedAt
			}))
	};
};
