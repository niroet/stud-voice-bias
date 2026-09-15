import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				brand: {
					50: '#eef5ff',
					100: '#dbe7ff',
					500: '#3b6bb0', // 5.13:1 Kontrast auf Weiß (WCAG AA)
					600: '#2f5a96',
					700: '#234578'
				}
			},
			fontFamily: {
				sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
			}
		}
	},
	plugins: []
} satisfies Config;
