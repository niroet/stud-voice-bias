import { buildLongCsv, buildWideCsv } from '$lib/server/csvExport';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const format = url.searchParams.get('format') ?? 'long';
	const csv = format === 'wide' ? await buildWideCsv() : await buildLongCsv();
	const filename = format === 'wide' ? 'stud_wide.csv' : 'stud_long.csv';
	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
