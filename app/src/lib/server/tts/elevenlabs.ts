import fs from 'node:fs/promises';
import path from 'node:path';

const ELEVEN_API_BASE = 'https://api.elevenlabs.io/v1';
const env = process.env;

type ElevenLabsConfig = {
	apiKey: string;
	voiceId: string;
	modelId: string;
	stability: number;
	similarityBoost: number;
	style: number;
	useSpeakerBoost: boolean;
};

export function isElevenLabsConfigured(): boolean {
	return Boolean(env.ELEVENLABS_API_KEY) && Boolean(env.ELEVENLABS_VOICE_ID);
}

function getElevenLabsConfig(): ElevenLabsConfig {
	if (!env.ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY fehlt');
	if (!env.ELEVENLABS_VOICE_ID) throw new Error('ELEVENLABS_VOICE_ID fehlt');
	return {
		apiKey: env.ELEVENLABS_API_KEY,
		voiceId: env.ELEVENLABS_VOICE_ID,
		modelId: 'eleven_v3',
		stability: 0.35,
		similarityBoost: 0.75,
		style: 0.45,
		useSpeakerBoost: true
	};
}

export async function synthesizeElevenLabs(text: string, outPath: string): Promise<void> {
	const cfg = getElevenLabsConfig();
	const url = `${ELEVEN_API_BASE}/text-to-speech/${cfg.voiceId}?output_format=mp3_44100_128`;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'xi-api-key': cfg.apiKey,
			'Content-Type': 'application/json',
			Accept: 'audio/mpeg'
		},
		body: JSON.stringify({
			text,
			model_id: cfg.modelId,
			voice_settings: {
				stability: cfg.stability,
				similarity_boost: cfg.similarityBoost,
				style: cfg.style,
				use_speaker_boost: cfg.useSpeakerBoost
			}
		})
	});

	if (!response.ok) {
		const errBody = await response.text();
		throw new Error(`ElevenLabs ${response.status}: ${errBody}`);
	}

	await fs.mkdir(path.dirname(outPath), { recursive: true });
	const buffer = Buffer.from(await response.arrayBuffer());
	await fs.writeFile(outPath, buffer);
}
