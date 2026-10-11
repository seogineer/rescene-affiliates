import type { APIRoute } from 'astro';
import { getAppearances } from '../lib/appearances';
import { buildIcs } from '../lib/ics';
import { url } from '../config';

export const GET: APIRoute = async ({ site }) => {
	const items = await getAppearances();
	const events = items
		.filter(({ entry }) => entry.data.eventDate)
		.map(({ entry: e }) => ({
			uid: `${e.id}@remine.fan`,
			title: e.data.name,
			date: e.data.eventDate!,
			time: e.data.eventTime,
			url: new URL(url(`appearances/${e.id}/`), site).href,
			description: e.data.summary,
		}))
		.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));
	return new Response(buildIcs(events, '리센느 일정 (리센느 계열사)', new Date()), {
		headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
	});
};
