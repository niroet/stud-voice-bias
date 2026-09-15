import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { cases, responses, sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const idx = parseInt(params.index, 10);
	if (Number.isNaN(idx) || idx < 0 || idx > 7) error(404, 'Ungültiger Trial-Index');

	const session = await db.query.sessions.findFirst({ where: eq(sessions.id, params.sessionId) });
	if (!session) error(404, 'Session fehlt');

	const assignmentItem = session.caseAssignment[idx];
	if (!assignmentItem) error(404, 'Kein Trial an diesem Index');

	const caseData = await db.query.cases.findFirst({ where: eq(cases.id, assignmentItem.caseId) });
	if (!caseData) error(500, `Case ${assignmentItem.caseId} fehlt`);

	return {
		index: idx,
		caseData: { ...caseData, aiCondition: assignmentItem.aiCondition, refuteCoinFlip: assignmentItem.refuteCoinFlip ?? false },
		voice: assignmentItem.voice,
		block: assignmentItem.block,
		position: assignmentItem.position
	};
};

const schema = z.object({
	caseId: z.string(),
	block: z.coerce.number(),
	voice: z.enum(['anthropomorphic', 'machine']),
	aiCondition: z.enum(['confirm', 'refute']),
	position: z.coerce.number(),
	initialPick: z.enum(['A', 'B', 'C']),
	initialConfidence: z.coerce.number().int().min(1).max(7),
	finalPick: z.enum(['A', 'B', 'C']),
	finalConfidence: z.coerce.number().int().min(1).max(7),
	audioFile: z.string(),
	initialDecisionMs: z.coerce.number().int(),
	finalDecisionMs: z.coerce.number().int(),
	audioPlayedAt: z.coerce.date().optional(),
	audioCompletedAt: z.coerce.date().optional(),
	visibilityLost: z
		.string()
		.optional()
		.transform((v) => v === 'true')
});

export const actions: Actions = {
	default: async ({ request, params }) => {
		const data = Object.fromEntries(await request.formData());
		const parsed = schema.safeParse(data);
		if (!parsed.success) return { ok: false, errors: parsed.error.flatten() };
		const v = parsed.data;

		await db.insert(responses).values({
			id: randomUUID(),
			sessionId: params.sessionId,
			caseId: v.caseId,
			block: v.block,
			voice: v.voice,
			aiCondition: v.aiCondition,
			position: v.position,
			initialPick: v.initialPick,
			initialConfidence: v.initialConfidence,
			finalPick: v.finalPick,
			finalConfidence: v.finalConfidence,
			audioFile: v.audioFile,
			initialDecisionMs: v.initialDecisionMs,
			finalDecisionMs: v.finalDecisionMs,
			audioPlayedAt: v.audioPlayedAt ?? new Date(),
			audioCompletedAt: v.audioCompletedAt ?? null,
			visibilityLost: v.visibilityLost
		});

		const idx = parseInt(params.index, 10);
		// Index 3 und 7 sind die letzten Trials von Block 1 und 2.
		if (idx === 3) redirect(303, `/study/${params.sessionId}/voice-check/1`);
		if (idx === 7) redirect(303, `/study/${params.sessionId}/voice-check/2`);
		redirect(303, `/study/${params.sessionId}/trial/${idx + 1}`);
	}
};
