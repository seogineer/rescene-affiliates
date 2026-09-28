import { getCollection } from 'astro:content';

/** 목록과 상세 페이지가 같은 순서(최신 시작일 먼저)와 SCENE 번호를 쓰도록 한 곳에서 만든다. */
export async function getSponsors() {
	const all = await getCollection('sponsors');
	all.sort((a, b) => (b.data.startDate ?? '').localeCompare(a.data.startDate ?? ''));
	return all.map((entry, i) => ({ entry, scene: String(i + 1).padStart(2, '0') }));
}
