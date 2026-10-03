// GoatCounter 방문 수를 푸터에 보여주는 데 쓰는 순수 함수들. 테스트를 node로 돌릴 수 있게 import하지 않는다.

/**
 * 공개 카운터는 날짜 경계를 항상 UTC로 계산하고(계정 시간대 설정과 무관), start에는 날짜만 받는다.
 * 그래서 '오늘'은 UTC 날짜의 시작부터, 즉 한국 시간 매일 오전 9시에 초기화된다.
 */
export function todayStart(d: Date): string {
	return d.toISOString().slice(0, 10);
}

/** GoatCounter는 숫자를 사용자 설정에 따라 "1,234", "1 234"(좁은 공백) 같은 문자열로 준다. 숫자로 읽을 수 없으면 null. */
export function parseCount(v: unknown): number | null {
	if (typeof v !== 'string') return null;
	const digits = v.replace(/[,.'’\s\u202f]/g, '');
	return /^\d+$/.test(digits) ? Number(digits) : null;
}

export function counterUrl(code: string, start?: string): string {
	return `https://${code}.goatcounter.com/counter/TOTAL.json${start ? `?start=${start}` : ''}`;
}

const n = (v: number) => v.toLocaleString('ko-KR');

/** 전체를 못 읽으면 줄 전체를 숨기고(null), 오늘만 못 읽으면 전체만 보여준다. */
export function formatVisits(today: number | null, total: number | null): string | null {
	if (total === null) return null;
	return today === null ? `전체 ${n(total)}` : `오늘 ${n(today)} · 전체 ${n(total)}`;
}
