import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const EDGE_VOICE = 'de-DE-KatjaNeural';
const EDGE_PITCH = '-30Hz';
const EDGE_RATE = '-5%';

export async function synthesizeEdgeTts(text: string, outPath: string): Promise<void> {
	await fs.mkdir(path.dirname(outPath), { recursive: true });
	await runCommand('uvx', [
		'--from',
		'edge-tts',
		'edge-tts',
		'--voice',
		EDGE_VOICE,
		`--pitch=${EDGE_PITCH}`,
		`--rate=${EDGE_RATE}`,
		'--text',
		text,
		'--write-media',
		outPath
	]);
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
