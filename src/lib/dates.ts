// 날짜는 스키마에서 YYYY, YYYY-MM, YYYY-MM-DD 문자열로 통일되므로 문자열 비교로 순서가 맞다.
// 테스트를 node로 바로 돌릴 수 있게 이 파일은 아무것도 import하지 않는다.
type Dated = { date?: string };

export function latestDate(items: Dated[]): string | undefined {
	let max: string | undefined;
	for (const { date } of items) if (date && (!max || date > max)) max = date;
	return max;
}

/** YAML은 따옴표 없는 2025-01-01을 Date로, 2025를 숫자로 읽으므로 모두 문자열로 통일한다. */
export function toDateString(v: string | number | Date): string {
	return v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
}

/** 최신 먼저, 날짜가 없는 항목은 맨 뒤. */
export function byDateDesc(a: Dated, b: Dated): number {
	if (!a.date) return b.date ? 1 : 0;
	if (!b.date) return -1;
	return b.date.localeCompare(a.date);
}

/** 최근 출연일 순, 같은 날이면 이름 가나다순. */
export function byLatestThenName(a: { latest?: string; name: string }, b: { latest?: string; name: string }): number {
	return byDateDesc({ date: a.latest }, { date: b.latest }) || a.name.localeCompare(b.name, 'ko');
}
