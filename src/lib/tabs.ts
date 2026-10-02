// 메인 탭은 주소 해시(#sponsors, #appearances)로 고른다. 테스트를 node로 돌릴 수 있게 import하지 않는다.
export const TABS = ['sponsors', 'appearances'] as const;
export type Tab = (typeof TABS)[number];

/** 모르는 해시나 빈 해시는 기업 탭으로 본다. */
export function tabFromHash(hash: string): Tab {
	return hash === '#appearances' ? 'appearances' : 'sponsors';
}
