// 통합 검색. 공백 무시, 대소문자 무시, 초성 검색을 지원한다. 테스트를 node로 바로 돌릴 수 있게 이 파일은 아무것도 import하지 않는다.
export type Entry = { name: string; kind: string; url: string; text: string; aliases: string };

const CHOSUNG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';

export const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

export function chosung(s: string): string {
	let out = '';
	for (const ch of s) {
		const c = ch.charCodeAt(0);
		if (c >= 0xac00 && c <= 0xd7a3) out += CHOSUNG[Math.floor((c - 0xac00) / 588)];
		else out += ch;
	}
	return out;
}

const isChosungQuery = (q: string) => q.length > 0 && [...q].every((c) => CHOSUNG.includes(c));

/** 점수가 높을수록 위. 0이면 검색 결과가 아니다. */
export function score(query: string, e: Entry): number {
	const q = normalize(query);
	if (!q) return 0;
	const name = normalize(e.name);
	const aliases = normalize(e.aliases);
	if (isChosungQuery(q)) {
		const cn = chosung(name);
		const ca = chosung(aliases);
		if (cn.startsWith(q)) return 80;
		if (cn.includes(q)) return 60;
		return ca.includes(q) ? 40 : 0;
	}
	if (name === q) return 100;
	if (name.startsWith(q)) return 90;
	if (name.includes(q)) return 70;
	if (aliases.includes(q)) return 60;
	return normalize(e.text).includes(q) ? 20 : 0;
}

export function search(query: string, entries: Entry[], limit = 8): Entry[] {
	return entries
		.map((e) => ({ e, s: score(query, e) }))
		.filter((x) => x.s > 0)
		.sort((a, b) => b.s - a.s || a.e.name.localeCompare(b.e.name, 'ko'))
		.slice(0, limit)
		.map((x) => x.e);
}

/** 멤버·그룹의 영문 표기. 문서에 멤버가 적혀 있으면 영문 이름으로도 찾을 수 있다. */
export const MEMBER_ALIASES: Record<string, string> = {
	원이: 'woni wony won-i',
	미나미: 'minami',
	리브: 'liv',
	메이: 'may mei',
	제나: 'zena jena',
};
