import { db } from './db';
import { sessions, responses } from './db/schema';

function csvEscape(v: unknown): string {
	if (v === null || v === undefined) return '';
	const s = String(v);
	if (s.includes(',') || s.includes('"') || s.includes('\n')) {
		return '"' + s.replace(/"/g, '""') + '"';
	}
	return s;
}

function toCsv(rows: Array<Record<string, unknown>>): string {
	if (rows.length === 0) return '';
	const headers = Object.keys(rows[0]);
	const lines = [headers.join(',')];
	for (const row of rows) {
		lines.push(headers.map((h) => csvEscape(row[h])).join(','));
	}
	return lines.join('\n');
}

export async function buildLongCsv(): Promise<string> {
	const allSessions = await db.select().from(sessions);
	const allResponses = await db.select().from(responses);
	const sessionById = new Map(allSessions.map((s) => [s.id, s]));

	const rows = allResponses.map((r) => {
		const session = sessionById.get(r.sessionId);
		const demo = session?.demographics ?? null;
		return {
			session_id: r.sessionId,
			case_id: r.caseId,
			ai_condition: r.aiCondition,
			block: r.block,
			voice: r.voice,
			position: r.position,
			initial_pick: r.initialPick,
			initial_confidence: r.initialConfidence,
			final_pick: r.finalPick,
			final_confidence: r.finalConfidence,
			confidence_shift: r.finalConfidence - r.initialConfidence,
			pick_changed: r.initialPick !== r.finalPick ? 1 : 0,
			initial_decision_ms: r.initialDecisionMs,
			final_decision_ms: r.finalDecisionMs,
			visibility_lost: r.visibilityLost ? 1 : 0,
			audio_file: r.audioFile,
			age: demo?.age ?? '',
			gender: demo?.gender ?? '',
			exp_symptom_checkers: demo?.experienceSymptomCheckers ?? '',
			exp_voice_ai: demo?.experienceVoiceAi ?? ''
		};
	});
	return toCsv(rows);
}

export async function buildWideCsv(): Promise<string> {
	const allSessions = await db.select().from(sessions);
	const allResponses = await db.select().from(responses);

	const wideRows = allSessions
		.filter((s) => s.completedAt && s.exitCode === 'complete')
		.map((s) => {
			const sessionResp = allResponses.filter((r) => r.sessionId === s.id);
			const row: Record<string, unknown> = {
				session_id: s.id,
				mode: s.mode,
				block_order: s.blockOrder,
				completed_at: s.completedAt?.toISOString() ?? '',
				age: s.demographics?.age ?? '',
				gender: s.demographics?.gender ?? '',
				exp_symptom_checkers: s.demographics?.experienceSymptomCheckers ?? '',
				exp_voice_ai: s.demographics?.experienceVoiceAi ?? ''
			};
			for (const r of sessionResp) {
				const prefix = `t${r.block}_${r.position}`;
				row[`${prefix}_case`] = r.caseId;
				row[`${prefix}_voice`] = r.voice;
				row[`${prefix}_ai_condition`] = r.aiCondition;
				row[`${prefix}_initial_pick`] = r.initialPick;
				row[`${prefix}_initial_conf`] = r.initialConfidence;
				row[`${prefix}_final_pick`] = r.finalPick;
				row[`${prefix}_final_conf`] = r.finalConfidence;
				row[`${prefix}_shift`] = r.finalConfidence - r.initialConfidence;
			}
			const vp = s.voicePerception;
			if (vp) {
				for (const [k, v] of Object.entries(vp.voiceA ?? {})) row[`vpA_${k}`] = v;
				for (const [k, v] of Object.entries(vp.voiceB ?? {})) row[`vpB_${k}`] = v;
			}
			return row;
		});
	return toCsv(wideRows);
}
