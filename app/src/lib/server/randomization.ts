import type { Case } from './db/schema';
import { VOICE_PERCEPTION_ITEMS, type VoicePerceptionItem } from '$lib/voicePerception';

export type Voice = 'anthropomorphic' | 'machine';
export type BlockOrder = 'anthro_first' | 'machine_first';

export type AiCondition = 'confirm' | 'refute';

export type CaseAssignment = {
	block: 1 | 2;
	voice: Voice;
	caseId: string;
	position: number;
	aiCondition: AiCondition;
	refuteCoinFlip: boolean;
};

// Mulberry32
function prng(seed: number) {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// FNV-1a
function hashSeed(s: string): number {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
	const result = arr.slice();
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/**
 * Deterministisch pro Session-ID. Aus den 12 aktiven Cases werden 8 gezogen, nach
 * `order` sortiert und in 4 Paare geteilt. Pro Paar entscheidet ein Münzwurf, welcher
 * Case confirm und welcher refute ist (4 confirm und 4 refute pro Session). Jeder Block
 * bekommt 2 confirm und 2 refute in zufälliger Reihenfolge.
 *
 * Die Reihenfolge der rng()-Aufrufe bestimmt die Zuweisung. Wird sie geändert, erhalten
 * dieselben Session-IDs andere Zuweisungen als in der erhobenen Studie.
 */
export function buildAssignment(
	sessionId: string,
	cases: Case[]
): { blockOrder: BlockOrder; assignment: CaseAssignment[] } {
	const active = cases.filter((c) => c.active);
	if (active.length !== 12) {
		throw new Error(`Erwartet 12 active Cases, gefunden: ${active.length}`);
	}

	const rng = prng(hashSeed(sessionId));

	const ordered = active.slice().sort((a, b) => a.order - b.order);
	const pool = shuffle(ordered, rng).slice(0, 8);

	const sorted = pool.slice().sort((a, b) => a.order - b.order);
	const tagged: { c: Case; aiCondition: AiCondition }[] = [];
	for (let i = 0; i < 8; i += 2) {
		const flip = rng() < 0.5;
		tagged.push({ c: sorted[i], aiCondition: flip ? 'confirm' : 'refute' });
		tagged.push({ c: sorted[i + 1], aiCondition: flip ? 'refute' : 'confirm' });
	}

	const confirms = tagged.filter((t) => t.aiCondition === 'confirm');
	const refutes = tagged.filter((t) => t.aiCondition === 'refute');

	const blockOrder: BlockOrder = rng() < 0.5 ? 'anthro_first' : 'machine_first';

	const cShuf = shuffle(confirms, rng);
	const rShuf = shuffle(refutes, rng);

	const block1 = shuffle([...cShuf.slice(0, 2), ...rShuf.slice(0, 2)], rng);
	const block2 = shuffle([...cShuf.slice(2, 4), ...rShuf.slice(2, 4)], rng);

	const voiceBlock1: Voice = blockOrder === 'anthro_first' ? 'anthropomorphic' : 'machine';
	const voiceBlock2: Voice = voiceBlock1 === 'anthropomorphic' ? 'machine' : 'anthropomorphic';

	const assignment: CaseAssignment[] = [
		...block1.map((t, i) => ({ block: 1 as const, voice: voiceBlock1, caseId: t.c.id, position: i + 1, aiCondition: t.aiCondition, refuteCoinFlip: rng() < 0.5 })),
		...block2.map((t, i) => ({ block: 2 as const, voice: voiceBlock2, caseId: t.c.id, position: i + 1, aiCondition: t.aiCondition, refuteCoinFlip: rng() < 0.5 }))
	];

	return { blockOrder, assignment };
}

// Eigene Seed-Suffixe, damit die Übung unabhängig von der Trial-Zuweisung randomisiert wird.
export function practiceCondition(sessionId: string): AiCondition {
	const rng = prng(hashSeed(sessionId + ':practice'));
	return rng() < 0.5 ? 'confirm' : 'refute';
}

export function practiceRefuteCoinFlip(sessionId: string): boolean {
	const rng = prng(hashSeed(sessionId + ':practice-refute'));
	return rng() < 0.5;
}

export function shuffleVoicePerceptionItems(sessionId: string, voiceLabel: 'A' | 'B'): VoicePerceptionItem[] {
	const rng = prng(hashSeed(sessionId + ':vp:' + voiceLabel));
	return shuffle([...VOICE_PERCEPTION_ITEMS], rng);
}
