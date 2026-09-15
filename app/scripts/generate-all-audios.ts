// bun run scripts/generate-all-audios.ts [--force]
import { db } from '../src/lib/server/db/index';
import { cases } from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateAudiosForCase } from '../src/lib/server/audio/generate';

const MAX_RETRIES = 2;

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			return await fn();
		} catch (e) {
			if (attempt < MAX_RETRIES) {
				const msg = e instanceof Error ? e.message : String(e);
				console.log(`retry ${attempt + 1}/${MAX_RETRIES} (${msg})`);
				await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
			} else {
				throw e;
			}
		}
	}
	throw new Error('unreachable');
}

async function main() {
	const force = process.argv.includes('--force');
	const allCases = await db.select().from(cases);
	console.log(`STUD Audio-Generation${force ? ' (force)' : ''}: ${allCases.length} Cases\n`);

	let failed = 0;
	for (const c of allCases) {
		process.stdout.write(`   ${c.id} ... `);
		try {
			const audios = await withRetry(() => generateAudiosForCase(c, force));
			await db.update(cases).set({ audios, updatedAt: new Date() }).where(eq(cases.id, c.id));
			console.log('ok');
		} catch (e) {
			failed++;
			console.log('FEHLER', e instanceof Error ? e.message : e);
		}
	}

	console.log(`\nFertig (${failed} Fehler)`);
	if (failed > 0) process.exit(1);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.then(() => process.exit(0));
