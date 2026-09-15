import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { synthesizeElevenLabs, isElevenLabsConfigured } from '$lib/server/tts/elevenlabs';
import { synthesizeEdgeTts } from '$lib/server/tts/edgeTts';
import type { Case } from '$lib/server/db/schema';

const STATIC_AUDIO = path.resolve(process.cwd(), 'static', 'audio');

type Pick = 'A' | 'B' | 'C';

// Machine-Stimme (Edge TTS): gleicher Inhalt wie renderTextAnthro, ohne Audio-Tags und Füllwörter.
function renderTextPlain(c: Case, pick: Pick): string {
	const dx = pick === 'A' ? c.optionA : pick === 'B' ? c.optionB : c.optionC;
	const explain = pick === 'A' ? c.explainA : pick === 'B' ? c.explainB : c.explainC;
	return explain || `Aufgrund der beschriebenen Symptome denke ich, dass es sich um ${dx} handelt.`;
}

// Anthropomorphe Stimme (ElevenLabs v3): Audio-Tags [breath]/[pause] und Füllwörter
// verändern nur die Sprechweise, nicht den Inhalt.
function renderTextAnthro(c: Case, pick: Pick): string {
	const dx = pick === 'A' ? c.optionA : pick === 'B' ? c.optionB : c.optionC;
	const explain = pick === 'A' ? c.explainA : pick === 'B' ? c.explainB : c.explainC;
	const intro = pick === 'A' ? 'Also... [breath]' : pick === 'B' ? 'Ähm... [breath]' : 'Ok, also... [breath]';
	if (!explain) {
		return `${intro} aufgrund der beschriebenen Symptome [pause] denke ich, dass es sich um ${dx} handelt.`;
	}
	const firstPeriod = explain.indexOf('. ');
	const explainTagged =
		firstPeriod > 0
			? `${explain.slice(0, firstPeriod + 1)} [breath] ${explain.slice(firstPeriod + 2)}`
			: explain;
	return `${intro} ${explainTagged}`;
}

async function fileExists(p: string): Promise<boolean> {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

async function commandExists(cmd: string): Promise<boolean> {
	return new Promise((resolve) => {
		const child = spawn('which', [cmd], { stdio: 'ignore' });
		child.on('close', (code) => resolve(code === 0));
		child.on('error', () => resolve(false));
	});
}

// Ohne uvx gibt es kein Edge TTS. Dann wird für die Machine-Stimme ein Sinuston erzeugt,
// damit der Ablauf trotzdem testbar ist.
async function ffmpegPlaceholder(text: string, outPath: string): Promise<void> {
	const duration = Math.min(25, Math.max(2, text.length * 0.06));
	const args = [
		'-y',
		'-f',
		'lavfi',
		'-i',
		`sine=frequency=400:duration=${duration}`,
		'-af',
		`tremolo=f=8:d=0.4,afade=t=in:d=0.05,afade=t=out:st=${duration - 0.2}:d=0.2`,
		'-codec:a',
		'libmp3lame',
		'-b:a',
		'128k',
		outPath
	];
	await fs.mkdir(path.dirname(outPath), { recursive: true });
	await runCommand('ffmpeg', args);
}

function runCommand(cmd: string, args: string[]): Promise<void> {
	return new Promise((resolve, reject) => {
		const child = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
		let stderr = '';
		child.stderr.on('data', (d) => (stderr += d.toString()));
		child.on('error', reject);
		child.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`${cmd} failed (${code}): ${stderr.slice(-300)}`));
		});
	});
}

// Beide Stimmen auf -16 LUFS (EBU R128), damit die Lautstärke nicht mit dem Stimmtyp variiert.
async function normalizeLoudness(filePath: string): Promise<void> {
	if (!(await fileExists(filePath))) {
		throw new Error(`normalizeLoudness: input file missing: ${filePath}`);
	}
	const tmpPath = filePath + '.tmp.mp3';
	await runCommand('ffmpeg', [
		'-y',
		'-i',
		filePath,
		'-af',
		'loudnorm=I=-16:TP=-1.5:LRA=11',
		'-codec:a',
		'libmp3lame',
		'-b:a',
		'128k',
		tmpPath
	]);
	if (!(await fileExists(tmpPath))) {
		throw new Error(`normalizeLoudness: ffmpeg produced no output for ${filePath}`);
	}
	await fs.rename(tmpPath, filePath);
}

export async function generateAudiosForCase(c: Case, force = false): Promise<Case['audios']> {
	const picks: Pick[] = ['A', 'B', 'C'];
	const audios: Case['audios'] = {
		anthropomorphic: { A: '', B: '', C: '' },
		machine: { A: '', B: '', C: '' }
	};

	const uvxAvailable = await commandExists('uvx');

	for (const pick of picks) {
		const relPath = `/audio/${c.id}/anthropomorphic/${pick}.mp3`;
		const absPath = path.join(STATIC_AUDIO, c.id, 'anthropomorphic', `${pick}.mp3`);
		if (isElevenLabsConfigured()) {
			if (!force && await fileExists(absPath)) {
				audios.anthropomorphic[pick] = relPath;
			} else {
				const text = renderTextAnthro(c, pick);
				await synthesizeElevenLabs(text, absPath);
				if (!(await fileExists(absPath))) {
					throw new Error(`ElevenLabs produced no output for ${c.id}/anthropomorphic/${pick}`);
				}
				await normalizeLoudness(absPath);
				audios.anthropomorphic[pick] = relPath;
			}
		}

		const machineRelPath = `/audio/${c.id}/machine/${pick}.mp3`;
		const machineAbsPath = path.join(STATIC_AUDIO, c.id, 'machine', `${pick}.mp3`);
		if (!force && await fileExists(machineAbsPath)) {
			audios.machine[pick] = machineRelPath;
		} else {
			const machineText = renderTextPlain(c, pick);
			if (uvxAvailable) {
				await synthesizeEdgeTts(machineText, machineAbsPath);
				if (!(await fileExists(machineAbsPath))) {
					throw new Error(`Edge TTS produced no output for ${c.id}/machine/${pick}`);
				}
				await normalizeLoudness(machineAbsPath);
			} else {
				await ffmpegPlaceholder(machineText, machineAbsPath);
			}
			audios.machine[pick] = machineRelPath;
		}
	}

	return audios;
}
