// 콘텐츠의 출처·미디어·공식 페이지 링크를 점검한다. 사용: node scripts/check-links.mjs [--limit N]
// 봇을 막는 사이트(인스타그램, X, 일부 언론사)가 많고 실행 환경에 따라 느린 사이트도 있어서,
// 404·410과 도메인 없음·연결 거부만 '깨짐'으로 보고 시간 초과 같은 일시적 실패는 경고로만 알린다.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIRS = ['src/content/sponsors', 'src/content/appearances'];
const urls = new Map(); // url -> 쓰인 파일들
for (const dir of DIRS) {
	for (const f of readdirSync(dir).filter((n) => n.endsWith('.yaml'))) {
		const text = readFileSync(join(dir, f), 'utf8');
		for (const m of text.matchAll(/^\s*(?:-\s+)?(?:url|website):\s*"?(https?:\/\/[^\s"]+)"?/gm)) {
			if (!urls.has(m[1])) urls.set(m[1], new Set());
			urls.get(m[1]).add(join(dir, f));
		}
	}
}

const limitArg = process.argv.indexOf('--limit');
const list = [...urls.keys()].slice(0, limitArg > 0 ? Number(process.argv[limitArg + 1]) : undefined);
const DEAD = new Set(['ENOTFOUND', 'ECONNREFUSED']);
const UA = 'Mozilla/5.0 (compatible; remine-fan-linkcheck/1.0; +https://remine.fan)';

async function check(url) {
	for (const method of ['HEAD', 'GET']) {
		try {
			const res = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': UA } });
			if (res.status === 404 || res.status === 410) {
				if (method === 'HEAD') continue; // HEAD를 막는 서버도 있어서 GET으로 한 번 더 본다.
				return { url, broken: `HTTP ${res.status}` };
			}
			return { url, ok: true };
		} catch (e) {
			if (method === 'GET') {
				const code = e.cause?.code ?? e.name;
				return DEAD.has(code) ? { url, broken: `접속 실패 (${code})` } : { url, warn: `응답 없음 (${code})` };
			}
		}
	}
	return { url, ok: true };
}

const results = [];
let next = 0;
await Promise.all(
	Array.from({ length: 8 }, async () => {
		while (next < list.length) results.push(await check(list[next++]));
	}),
);

const broken = results.filter((r) => r.broken).sort((a, b) => a.url.localeCompare(b.url));
const warned = results.filter((r) => r.warn);
console.log(`점검 ${results.length}개, 깨짐 ${broken.length}개, 경고 ${warned.length}개`);
for (const b of broken) console.log(`- ${b.url} — ${b.broken}\n  ${[...urls.get(b.url)].join(', ')}`);
if (warned.length) console.log('\n경고(일시적일 수 있음):\n' + warned.map((w) => `- ${w.url} — ${w.warn}`).join('\n'));
process.exit(broken.length ? 1 : 0);
