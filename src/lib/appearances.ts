import { getCollection } from 'astro:content';
import { youtubeId } from './youtube';
import { latestDate, byDateDesc, byLatestThenName } from './dates';

/** 목록·상세·메인이 같은 순서(최근 출연일 먼저)를 쓰도록 한 곳에서 만든다. */
export async function getAppearances() {
	const all = await getCollection('appearances');
	const items = all.map((entry) => {
		const media = [...entry.data.media].sort(byDateDesc);
		// 가장 최근 유튜브 회차의 썸네일을 카드 커버로 쓴다.
		const cover = media
			.filter((m) => m.platform === 'youtube')
			.map((m) => youtubeId(m.url))
			.find(Boolean);
		return { entry, media, latest: latestDate(media), cover: cover ?? null };
	});
	items.sort((a, b) => byLatestThenName({ latest: a.latest, name: a.entry.data.name }, { latest: b.latest, name: b.entry.data.name }));
	return items.map((item, i) => ({ ...item, tone: i % 3 }));
}
