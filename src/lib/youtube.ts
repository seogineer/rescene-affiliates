export function youtubeId(u: string) {
	try {
		const p = new URL(u);
		if (p.hostname === 'youtu.be') return p.pathname.slice(1);
		if (p.hostname.endsWith('youtube.com')) {
			if (p.pathname.startsWith('/shorts/')) return p.pathname.split('/')[2];
			return p.searchParams.get('v');
		}
	} catch {}
	return null;
}

// hqdefault는 4:3 레터박스가 있어서 16:9로 잘라 쓰면 위아래 검은 띠가 사라진다.
export const ytThumb = (id: string, q: 'hqdefault' | 'maxresdefault' = 'hqdefault') =>
	`https://i.ytimg.com/vi/${id}/${q}.jpg`;
export const ytWatch = (id: string) => `https://www.youtube.com/watch?v=${id}`;
