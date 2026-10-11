// 일정 분류. 테스트를 node로 바로 돌릴 수 있게 이 파일은 아무것도 import하지 않는다.
export type Event = { eventDate?: string; eventTime?: string; name: string };

/** 한국 시간 기준 오늘(YYYY-MM-DD). */
export function seoulToday(now = new Date()): string {
	return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(now);
}

const key = (e: Event) => `${e.eventDate}T${e.eventTime ?? '00:00'}`;

/** 날짜가 없는 항목은 뺀다. 오늘 일정은 시각과 상관없이 다가오는 일정에 둔다. 다가오는 건 가까운 순, 지난 건 최근 순. */
export function splitSchedule<T extends Event>(items: T[], today: string) {
	const dated = items.filter((e) => e.eventDate && /^\d{4}-\d{2}-\d{2}$/.test(e.eventDate));
	const upcoming = dated.filter((e) => e.eventDate! >= today).sort((a, b) => key(a).localeCompare(key(b)) || a.name.localeCompare(b.name, 'ko'));
	const past = dated.filter((e) => e.eventDate! < today).sort((a, b) => key(b).localeCompare(key(a)) || a.name.localeCompare(b.name, 'ko'));
	return { upcoming, past };
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
/** "10월 11일 (일) 16:10" 꼴. 시각이 없으면 날짜만. */
export function formatEvent(date: string, time?: string): string {
	const [y, m, d] = date.split('-').map(Number);
	const day = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
	return `${y}년 ${m}월 ${d}일 (${day})${time ? ` ${time}` : ''}`;
}
