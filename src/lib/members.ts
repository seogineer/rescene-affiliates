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
