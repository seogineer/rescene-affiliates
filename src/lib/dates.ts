// 날짜는 스키마에서 YYYY, YYYY-MM, YYYY-MM-DD 문자열로 통일되므로 문자열 비교로 순서가 맞다.
// 테스트를 node로 바로 돌릴 수 있게 이 파일은 아무것도 import하지 않는다.
type Dated = { date?: string };

export function latestDate(items: Dated[]): string | undefined {
	let max: string | undefined;
	for (const { date } of items) if (date && (!max || date > max)) max = date;
	return max;
}

/** 최신 먼저, 날짜가 없는 항목은 맨 뒤. */
export function byDateDesc(a: Dated, b: Dated): number {
	if (!a.date) return b.date ? 1 : 0;
	if (!b.date) return -1;
	return b.date.localeCompare(a.date);
}
