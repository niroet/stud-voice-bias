import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { shuffleVoicePerceptionItems } from '$lib/server/randomization';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const block = parseInt(params.block, 10);
	if (block !== 1 && block !== 2) error(404, 'Ungültiger Block');

	const voiceLabel = block === 1 ? 'A' : 'B';
	const itemOrder = shuffleVoicePerceptionItems(params.sessionId, voiceLabel);

	return {
		block,
		itemOrder
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const block = parseInt(params.block, 10);
		if (block !== 1 && block !== 2) error(404, 'Ungültiger Block');

		const formData = await request.formData();
		const answers = JSON.parse((formData.get('answers') as string) ?? '{}');

		const session = await db.query.sessions.findFirst({ where: eq(sessions.id, params.sessionId) });
		if (!session) error(404, 'Session fehlt');

		// Block 1 wird als voiceA gespeichert, Block 2 als voiceB, unabhängig vom Stimmtyp.
		const existing = session.voicePerception ?? { voiceA: null, voiceB: null };
		const updated = block === 1
			? { ...existing, voiceA: answers }
			: { ...existing, voiceB: answers };

		await db
			.update(sessions)
			.set({ voicePerception: updated })
			.where(eq(sessions.id, params.sessionId));

		if (block === 1) {
			redirect(303, `/study/${params.sessionId}/break`);
		} else {
			await db
				.update(sessions)
				.set({ completedAt: new Date(), exitCode: 'complete' })
				.where(eq(sessions.id, params.sessionId));
			redirect(303, `/study/${params.sessionId}/debrief`);
		}
	}
};
