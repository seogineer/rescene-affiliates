import { getCollection } from 'astro:content';
import { youtubeId } from './youtube';

/** 목록과 상세 페이지가 같은 순서(최신 시작일 먼저)와 SCENE 번호를 쓰도록 한 곳에서 만든다. */
export async function getSponsors() {
	const all = await getCollection('sponsors');
	all.sort((a, b) => (b.data.startDate ?? '').localeCompare(a.data.startDate ?? ''));
	return all.map((entry, i) => {
		// 첫 번째 유튜브 미디어의 썸네일을 카드 커버로 쓴다.
		const cover = entry.data.media
			.filter((m) => m.platform === 'youtube')
			.map((m) => youtubeId(m.url))
			.find(Boolean);
		return { entry, scene: String(i + 1).padStart(2, '0'), cover: cover ?? null, tone: i % 3 };
	});
}
