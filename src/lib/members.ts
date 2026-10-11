// 멤버 목록과 주소용 영문 이름. 테스트를 node로 바로 돌릴 수 있게 이 파일은 아무것도 import하지 않는다.
export const MEMBERS = ['원이', '미나미', '리브', '메이', '제나'] as const;
export type Member = (typeof MEMBERS)[number];

export const MEMBER_SLUG: Record<Member, string> = {
	원이: 'woni',
	미나미: 'minami',
	리브: 'liv',
	메이: 'may',
	제나: 'zena',
};

export function memberFromSlug(slug: string): Member | undefined {
	return MEMBERS.find((m) => MEMBER_SLUG[m] === slug);
}

/** members가 비어 있으면 그룹 전체라서 어느 멤버 페이지에도 넣지 않는다. */
export function forMember<T extends { members: readonly string[] }>(items: T[], member: Member): T[] {
	return items.filter((i) => i.members.includes(member));
}

type M = { members?: readonly string[] };

/** 문서 안의 영상·이미지 중 해당 멤버가 나오는 것. 영상에 멤버가 적혀 있으면 그것을 따르고,
 *  적혀 있지 않으면 문서가 멤버 한 명만 가리킬 때(예: 개인 광고)에 한해 그 멤버로 본다. */
export function mediaForMember<T extends M>(media: T[], docMembers: readonly string[], member: Member): T[] {
	return media.filter((m) => {
		const own = m.members ?? [];
		if (own.length > 0) return own.includes(member);
		return docMembers.length === 1 && docMembers[0] === member;
	});
}
