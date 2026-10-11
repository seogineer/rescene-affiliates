// 검색 결과용 문구와 구조화 데이터. 테스트를 node로 바로 돌릴 수 있게 이 파일은 아무것도 import하지 않는다.

/** 검색 결과에서 잘리지 않도록 줄이되 문장 중간에서 끊기면 …을 붙인다. */
export function clip(text: string, max = 150): string {
	const t = text.replace(/\s+/g, ' ').trim();
	if (t.length <= max) return t;
	const cut = t.slice(0, max - 1);
	const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('다 '));
	return (end > max * 0.6 ? cut.slice(0, end + 1) : cut.trimEnd()) + (end > max * 0.6 ? '' : '…');
}

export type Crumb = { name: string; url: string };

export function breadcrumbs(crumbs: Crumb[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
	};
}

export function website(siteUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: '리센느 계열사',
		alternateName: ['리센느 팬 사이트', '리마인 위키', 'RESCENE REMINE fan wiki', 'remine.fan'],
		url: siteUrl,
		inLanguage: 'ko',
		about: { '@type': 'MusicGroup', name: '리센느', alternateName: ['RESCENE', '리센느(RESCENE)'] },
	};
}

/** JSON-LD를 <script> 안에 넣을 때 </script>로 닫히지 않도록 < 를 이스케이프한다. */
export function jsonLdString(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function xmlEscape(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
