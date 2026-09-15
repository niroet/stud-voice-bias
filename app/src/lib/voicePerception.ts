export const VOICE_PERCEPTION_ITEMS = [
	'humanness',
	'naturalness',
	'pleasantness',
	'competence',
	'trust',
	'warmth',
	'intelligibility',
	'genderedness'
] as const;

export type VoicePerceptionItem = (typeof VOICE_PERCEPTION_ITEMS)[number];
