import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kstToUtc, fold, buildIcs } from '../src/lib/ics.ts';

test('kstToUtc는 한국 시간을 UTC로 바꾸고 날짜 경계를 넘긴다', () => {
	assert.equal(kstToUtc('2026-10-11', '16:10'), '20261011T071000Z');
	assert.equal(kstToUtc('2026-10-11', '08:30'), '20261010T233000Z');
	assert.equal(kstToUtc('2026-10-11', '23:30', 60), '20261011T153000Z');
});

test('fold는 한글도 75바이트를 넘지 않게 접는다', () => {
	const folded = fold('SUMMARY:' + '가'.repeat(60));
	for (const line of folded.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75);
	assert.equal(folded.replace(/\r\n /g, ''), 'SUMMARY:' + '가'.repeat(60));
});

test('buildIcs는 시각 있는 일정과 종일 일정을 구분하고 특수문자를 이스케이프한다', () => {
	const ics = buildIcs(
		[
			{ uid: 'a@x', title: 'A, B;C', date: '2026-10-11', time: '16:10', url: 'https://x/a/' },
			{ uid: 'b@x', title: 'B', date: '2026-10-31', url: 'https://x/b/' },
		],
		't',
		new Date('2026-10-11T00:00:00Z'),
	);
	assert.ok(ics.includes('SUMMARY:A\\, B\;C'));
	assert.ok(ics.includes('DTSTART:20261011T071000Z'));
	assert.ok(ics.includes('DTSTART;VALUE=DATE:20261031'));
	assert.ok(ics.includes('DTEND;VALUE=DATE:20261101'));
	assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
});
