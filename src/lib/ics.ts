// iCalendar(.ics) 문자열 만들기. 테스트를 node로 바로 돌릴 수 있게 이 파일은 아무것도 import하지 않는다.
export type IcsEvent = { uid: string; title: string; date: string; time?: string; url: string; description?: string };

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const compact = (d: string) => d.replace(/-/g, '');
const pad = (n: number) => String(n).padStart(2, '0');

/** 한국 시간(UTC+9) 날짜·시각을 UTC "YYYYMMDDTHHMMSSZ"로 바꾼다. addMinutes로 종료 시각도 만든다. */
export function kstToUtc(date: string, time: string, addMinutes = 0): string {
	const [y, m, d] = date.split('-').map(Number);
	const [hh, mm] = time.split(':').map(Number);
	const t = new Date(Date.UTC(y, m - 1, d, hh - 9, mm + addMinutes));
	return `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}T${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}00Z`;
}

/** 한 줄이 75바이트(UTF-8)를 넘지 않게 접는다. 이어지는 줄은 공백으로 시작한다. */
export function fold(line: string): string {
	const out: string[] = [];
	let cur = '';
	let bytes = 0;
	for (const ch of line) {
		const b = new TextEncoder().encode(ch).length;
		if (bytes + b > (out.length === 0 ? 75 : 74)) {
			out.push(cur);
			cur = '';
			bytes = 0;
		}
		cur += ch;
		bytes += b;
	}
	out.push(cur);
	return out.join('\r\n ');
}

export function buildIcs(events: IcsEvent[], name: string, stamp: Date): string {
	const dtstamp = `${stamp.getUTCFullYear()}${pad(stamp.getUTCMonth() + 1)}${pad(stamp.getUTCDate())}T${pad(stamp.getUTCHours())}${pad(stamp.getUTCMinutes())}00Z`;
	const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//remine.fan//RESCENE schedule//KO', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${esc(name)}`, 'X-WR-TIMEZONE:Asia/Seoul'];
	for (const e of events) {
		lines.push('BEGIN:VEVENT', `UID:${e.uid}`, `DTSTAMP:${dtstamp}`);
		if (e.time) {
			lines.push(`DTSTART:${kstToUtc(e.date, e.time)}`, `DTEND:${kstToUtc(e.date, e.time, 60)}`);
		} else {
			// 종일 일정의 DTEND는 다음 날(배타적)이다.
			const [y, m, d] = e.date.split('-').map(Number);
			const next = new Date(Date.UTC(y, m - 1, d + 1));
			lines.push(`DTSTART;VALUE=DATE:${compact(e.date)}`, `DTEND;VALUE=DATE:${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`);
		}
		lines.push(`SUMMARY:${esc(e.title)}`, `URL:${e.url}`);
		if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
		lines.push('END:VEVENT');
	}
	lines.push('END:VCALENDAR');
	return lines.map(fold).join('\r\n') + '\r\n';
}
