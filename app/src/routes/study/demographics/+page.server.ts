import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { sessions, cases } from '$lib/server/db/schema';
import { buildAssignment } from '$lib/server/randomization';
import { randomUUID } from 'node:crypto';
import type { Actions } from './$types';

const schema = z.object({
	age: z.string().min(1),
	gender: z.string().min(1),
	experienceSymptomCheckers: z.coerce.number().int().min(1).max(7),
	experienceVoiceAi: z.coerce.number().int().min(1).max(7)
});

export const actions: Actions = {
	default: async ({ request }) => {
		const data = Object.fromEntries(await request.formData());
		const parsed = schema.safeParse(data);
		if (!parsed.success) {
			return { ok: false, errors: parsed.error.flatten() };
		}

		const allCases = await db.select().from(cases);
		const sessionId = randomUUID();
		const { blockOrder, assignment } = buildAssignment(sessionId, allCases);

		await db.insert(sessions).values({
			id: sessionId,
			blockOrder,
			caseAssignment: assignment,
			demographics: parsed.data
		});

		redirect(303, `/study/${sessionId}/briefing`);
	}
};
