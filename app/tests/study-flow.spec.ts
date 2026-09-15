import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

async function pickOption(page: Page, letter: 'A' | 'B' | 'C') {
	await page.getByRole('button', { name: new RegExp(`^Option ${letter}:`) }).click();
	await page.waitForTimeout(700);
}

async function likert(page: Page, value: number) {
	await page.getByRole('button', { name: `Wert ${value} von 7` }).click();
	await page.waitForTimeout(700);
}

// Headless-Browser spielen MP3s nicht zuverlässig ab, daher werden play/ended simuliert.
async function passAudio(page: Page) {
	await page.waitForSelector('audio', { state: 'attached', timeout: 5000 });
	await page.evaluate(() => {
		const audio = document.querySelector('audio')!;
		audio.dispatchEvent(new Event('play'));
		audio.dispatchEvent(new Event('ended'));
	});
	await page.getByRole('button', { name: 'Weiter' }).click();
}

async function doTrial(page: Page) {
	await page.getByRole('button', { name: 'Weiter' }).click();
	await pickOption(page, 'A');
	await likert(page, 4);
	await passAudio(page);
	await pickOption(page, 'B');
	await likert(page, 5);
}

async function doVoiceCheck(page: Page) {
	for (let i = 0; i < 8; i++) {
		await likert(page, 4);
	}
}

async function startSession(page: Page): Promise<string> {
	await page.goto('/study');
	await expect(page).toHaveTitle(/STUD/);
	await page.getByRole('button', { name: 'Teilnehmen' }).click();

	await page.waitForURL('**/study/consent');
	await expect(page.getByRole('button', { name: 'Weiter' })).toBeDisabled();
	await page.getByRole('checkbox').check();
	await page.getByRole('button', { name: 'Weiter' }).click();

	await page.waitForURL('**/study/demographics');
	await page.getByLabel('Alter').selectOption('25–34');
	await page.getByLabel('Geschlecht').selectOption('weiblich');
	await page.getByRole('button', { name: 'Wert 3 von 7' }).first().click();
	await page.getByRole('button', { name: 'Wert 2 von 7' }).nth(1).click();

	const weiter = page.getByRole('button', { name: 'Weiter' });
	await expect(weiter).toBeEnabled();
	await Promise.all([page.waitForURL('**/briefing', { timeout: 15000 }), weiter.click()]);
	return new URL(page.url()).pathname.split('/')[2];
}

test('participant flow from landing page to debrief', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (err) => errors.push(err.message));

	const sessionId = await startSession(page);
	await page.getByRole('button', { name: 'Studie starten' }).click();

	await page.waitForURL('**/practice');
	await doTrial(page);

	await page.waitForURL('**/start');
	await page.getByRole('button', { name: 'Experiment starten' }).click();

	for (let i = 0; i < 4; i++) {
		await page.waitForURL(`**/trial/${i}`);
		await doTrial(page);
	}

	await page.waitForURL('**/voice-check/1');
	await doVoiceCheck(page);

	await page.waitForURL('**/break');
	await page.getByRole('button', { name: 'Weiter zu Block 2' }).click();

	for (let i = 4; i < 8; i++) {
		await page.waitForURL(`**/trial/${i}`);
		await doTrial(page);
	}

	await page.waitForURL('**/voice-check/2');
	await doVoiceCheck(page);

	await page.waitForURL('**/debrief');
	await expect(page.getByText('Vielen Dank')).toBeVisible();

	const reentry = await page.goto(`/study/${sessionId}/trial/0`);
	expect(reentry?.status()).toBe(410);

	expect(errors).toEqual([]);
});

test('abort deletes the session', async ({ page }) => {
	const sessionId = await startSession(page);
	await page.getByRole('button', { name: /Studie abbrechen/ }).click();
	await page.getByRole('button', { name: 'Ja, abbrechen' }).click();
	await page.waitForURL('**/study/aborted');

	const res = await page.goto(`/study/${sessionId}/briefing`);
	expect(res?.status()).toBe(404);
});

test('admin login, session detail and CSV export', async ({ page }) => {
	const password = process.env.ADMIN_PASSWORD;
	if (!password) throw new Error('ADMIN_PASSWORD muss für den Test gesetzt sein');

	const unauthorized = await page.request.get('/api/admin/export?format=long');
	expect(unauthorized.status()).toBe(401);

	await page.goto('/admin');
	await page.waitForURL('**/admin/login');
	await page.getByLabel('Passwort').fill(password);
	await page.getByRole('button', { name: 'Einloggen' }).click();
	await page.waitForURL(/\/admin$/);

	await page.getByRole('link', { name: 'Sessions' }).click();
	await page.waitForURL('**/admin/sessions');
	await page.locator('tbody a').first().click();
	await expect(page.getByRole('heading', { name: /Responses \(\d+\)/ })).toBeVisible();

	await page.getByRole('link', { name: 'Export' }).click();
	await page.waitForURL('**/admin/export');

	for (const [format, header] of [
		['long', 'session_id,case_id,ai_condition,block,voice,position,'],
		['wide', 'session_id,mode,block_order,completed_at,']
	] as const) {
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('link', { name: `Download ${format}.csv` }).click()
		]);
		const csv = readFileSync(await download.path(), 'utf8');
		expect(csv.startsWith(header)).toBe(true);
		expect(csv.toLowerCase()).not.toContain('<!doctype');

		const res = await page.request.get(`/api/admin/export?format=${format}`);
		expect(res.headers()['content-type']).toContain('text/csv');
	}
});
