// Wird im Browser importiert, daher keine Server-Imports.

export type Pick = 'A' | 'B' | 'C';
export type Voice = 'anthropomorphic' | 'machine';
export type AiCondition = 'confirm' | 'refute';

export type TrialCase = {
	id: string;
	symptoms: string;
	optionA: string;
	optionB: string;
	optionC: string;
	aiCondition: AiCondition;
	refuteCoinFlip: boolean;
	audios: { anthropomorphic: Record<Pick, string>; machine: Record<Pick, string> };
};

const ALL_PICKS: Pick[] = ['A', 'B', 'C'];

// confirm: Audio zur eigenen Wahl. refute: refuteCoinFlip wählt eine der beiden anderen Optionen.
export function pickAudioFile(c: TrialCase, voice: Voice, userInitialPick: Pick): string {
	if (c.aiCondition === 'confirm') return c.audios[voice][userInitialPick];
	const remaining = ALL_PICKS.filter((p) => p !== userInitialPick);
	const target = c.refuteCoinFlip ? remaining[0] : remaining[1];
	return c.audios[voice][target];
}

export type TrialPhase =
	| 'vignette'
	| 'initialPick'
	| 'initialConfidence'
	| 'audio'
	| 'finalPick'
	| 'finalConfidence';
