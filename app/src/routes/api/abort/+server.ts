import { db } from '$lib/server/db';
import { sessions, responses } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { sessionId } = (await request.json().catch(() => ({}))) as { sessionId?: string };
	if (!sessionId) return json({ ok: false }, { status: 400 });
	await db.delete(responses).where(eq(responses.sessionId, sessionId));
	await db.delete(sessions).where(eq(sessions.id, sessionId));
	return json({ ok: true });
};
