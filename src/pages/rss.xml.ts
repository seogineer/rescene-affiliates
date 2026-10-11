import type { APIRoute } from 'astro';
import { execFileSync } from 'node:child_process';
import { getSponsors } from '../lib/sponsors';
import { getAppearances } from '../lib/appearances';
import { clip, xmlEscape } from '../lib/seo';
import { url } from '../config';

/** 파일이 마지막으로 바뀐 커밋 시각. git 기록이 없으면 빌드 시각. */
function changedAt(filePath: string): Date {
	try {
		const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', filePath], { encoding: 'utf8' }).trim();
		if (out) return new Date(out);
	} catch {}
	return new Date();
}

export const GET: APIRoute = async ({ site }) => {
	const abs = (p: string) => new URL(url(p), site).href;
	const [sponsors, appearances] = await Promise.all([getSponsors(), getAppearances()]);
	const items = [
		...sponsors.map(({ entry: e }) => ({ title: `리센느 ${e.data.name} 광고·협찬`, link: abs(`sponsors/${e.id}/`), desc: e.data.summary, at: changedAt(e.filePath!) })),
		...appearances.map(({ entry: e }) => ({ title: `리센느 ${e.data.name} 출연`, link: abs(`appearances/${e.id}/`), desc: e.data.summary, at: changedAt(e.filePath!) })),
	]
		.sort((a, b) => b.at.getTime() - a.at.getTime() || a.title.localeCompare(b.title, 'ko'))
		.slice(0, 50);

	const body = items
		.map((i) => `<item><title>${xmlEscape(i.title)}</title><link>${i.link}</link><guid isPermaLink="true">${i.link}</guid><pubDate>${i.at.toUTCString()}</pubDate><description>${xmlEscape(clip(i.desc, 300))}</description></item>`)
		.join('\n');
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>리센느 계열사 새 소식</title>
<link>${abs('')}</link>
<description>리센느(RESCENE)와 함께한 기업·출연·일정의 새 문서와 수정 내역</description>
<language>ko</language>
${body}
</channel></rss>
`;
	return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
