import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// aiCondition gehört nicht zum Case, sie wird pro Session zugewiesen (randomization.ts).
export const cases = sqliteTable('cases', {
	id: text('id').primaryKey(),
	symptoms: text('symptoms').notNull(),
	optionA: text('option_a').notNull(),
	optionB: text('option_b').notNull(),
	optionC: text('option_c').notNull(),
	explainA: text('explain_a'),
	explainB: text('explain_b'),
	explainC: text('explain_c'),
	audios: text('audios', { mode: 'json' })
		.$type<{ anthropomorphic: Record<'A' | 'B' | 'C', string>; machine: Record<'A' | 'B' | 'C', string> }>()
		.notNull()
		.default({ anthropomorphic: { A: '', B: '', C: '' }, machine: { A: '', B: '', C: '' } }),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	order: integer('order').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	// Immer 'remote'; die Spalte bleibt, weil der Wide-Export sie enthält.
	mode: text('mode', { enum: ['remote'] })
		.notNull()
		.default('remote'),
	blockOrder: text('block_order', { enum: ['anthro_first', 'machine_first'] }).notNull(),
	caseAssignment: text('case_assignment', { mode: 'json' })
		.$type<Array<{ block: 1 | 2; voice: 'anthropomorphic' | 'machine'; caseId: string; position: number; aiCondition: 'confirm' | 'refute'; refuteCoinFlip: boolean }>>()
		.notNull(),
	demographics: text('demographics', { mode: 'json' })
		.$type<{
			age: string;
			gender: string;
			experienceSymptomCheckers: number;
			experienceVoiceAi: number;
		}>(),
	voicePerception: text('voice_perception', { mode: 'json' }).$type<{
		voiceA: VoicePerceptionItems | null;
		voiceB: VoicePerceptionItems | null;
	}>(),
	exitCode: text('exit_code', { enum: ['complete'] }),
	startedAt: integer('started_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	completedAt: integer('completed_at', { mode: 'timestamp' })
});

export type VoicePerceptionItems = {
	humanness: number;
	naturalness: number;
	pleasantness: number;
	competence: number;
	trust: number;
	warmth: number;
	intelligibility: number;
	genderedness: number; // 1 = klingt männlich, 7 = klingt weiblich
};

export const responses = sqliteTable('responses', {
	id: text('id').primaryKey(),
	sessionId: text('session_id')
		.notNull()
		.references(() => sessions.id, { onDelete: 'cascade' }),
	caseId: text('case_id')
		.notNull()
		.references(() => cases.id),
	block: integer('block').notNull(),
	voice: text('voice', { enum: ['anthropomorphic', 'machine'] }).notNull(),
	aiCondition: text('ai_condition', { enum: ['confirm', 'refute'] }).notNull(),
	position: integer('position').notNull(),
	initialPick: text('initial_pick', { enum: ['A', 'B', 'C'] }).notNull(),
	initialConfidence: integer('initial_confidence').notNull(),
	finalPick: text('final_pick', { enum: ['A', 'B', 'C'] }).notNull(),
	finalConfidence: integer('final_confidence').notNull(),
	audioFile: text('audio_file').notNull(),
	initialDecisionMs: integer('initial_decision_ms').notNull(),
	finalDecisionMs: integer('final_decision_ms').notNull(),
	audioPlayedAt: integer('audio_played_at', { mode: 'timestamp' }).notNull(),
	audioCompletedAt: integer('audio_completed_at', { mode: 'timestamp' }),
	visibilityLost: integer('visibility_lost', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export type Case = typeof cases.$inferSelect;
