// 갱신이 필요한 문서 가리기. 테스트를 node로 바로 돌릴 수 있게 이 파일은 아무것도 import하지 않는다.
export type Doc = { summary: string; eventDate?: string; status?: string };

export const isPending = (d: Doc) => d.summary.includes('확인필요') || d.status === '확인필요';

/** 일정이 지났는데 아직 확인필요인 문서(overdue)와, 아직 열리기 전이거나 날짜 없는 확인필요 문서(waiting)로 나눈다. */
export function splitPending<T extends Doc>(docs: T[], today: string) {
	const pending = docs.filter(isPending);
	const overdue = pending.filter((d) => d.eventDate && d.eventDate < today);
	const waiting = pending.filter((d) => !(d.eventDate && d.eventDate < today));
	return { overdue, waiting };
}
