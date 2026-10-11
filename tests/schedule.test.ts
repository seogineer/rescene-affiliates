import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitSchedule, formatEvent, seoulToday } from '../src/lib/schedule.ts';

const ev = (name: string, eventDate?: string, eventTime?: string) => ({ name, eventDate, eventTime });

test('splitSchedule은 오늘 일정을 다가오는 쪽에 두고 날짜 없는 항목은 뺀다', () => {
	const { upcoming, past } = splitSchedule([ev('a', '2026-10-11'), ev('b', '2026-10-10'), ev('c'), ev('d', '2026-10-12')], '2026-10-11');
	assert.deepEqual(upcoming.map((e) => e.name), ['a', 'd']);
	assert.deepEqual(past.map((e) => e.name), ['b']);
});

test('splitSchedule은 같은 날이면 시각순, 지난 일정은 최근 먼저', () => {
	const { upcoming, past } = splitSchedule([ev('late', '2026-10-20', '20:00'), ev('early', '2026-10-20', '09:00'), ev('p1', '2026-09-01'), ev('p2', '2026-09-05')], '2026-10-11');
	assert.deepEqual(upcoming.map((e) => e.name), ['early', 'late']);
	assert.deepEqual(past.map((e) => e.name), ['p2', 'p1']);
});

test('formatEvent는 요일과 시각을 붙인다', () => {
	assert.equal(formatEvent('2026-10-11', '16:10'), '2026년 10월 11일 (일) 16:10');
	assert.equal(formatEvent('2026-11-14'), '2026년 11월 14일 (토)');
});

test('seoulToday는 한국 날짜를 돌려준다', () => {
	assert.equal(seoulToday(new Date('2026-10-10T16:00:00Z')), '2026-10-11');
});
