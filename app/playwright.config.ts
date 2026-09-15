import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests',
	timeout: 120_000,
	use: {
		baseURL: 'http://localhost:3000'
	},
	webServer: {
		command: 'bun run build && bun run start',
		url: 'http://localhost:3000/study',
		reuseExistingServer: true,
		timeout: 180_000,
		// Ohne ORIGIN lehnt der Bun-Adapter Form-POSTs als Cross-Site ab.
		env: { ORIGIN: 'http://localhost:3000' }
	}
});
