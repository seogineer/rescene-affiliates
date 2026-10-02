import { test } from 'node:test';
import assert from 'node:assert/strict';
import { latestDate, byDateDesc } from '../src/lib/dates.ts';

test('latestDate는 가장 늦은 날짜를 고른다', () => {
	assert.equal(latestDate([{ date: '2026-03-01' }, { date: '2026-05-02' }, { date: '2025-12-31' }]), '2026-05-02');
});

test('latestDate는 날짜 없는 항목을 건너뛰고, 모두 없으면 undefined', () => {
	assert.equal(latestDate([{}, { date: '2026-01-01' }, {}]), '2026-01-01');
	assert.equal(latestDate([{}, {}]), undefined);
	assert.equal(latestDate([]), undefined);
});

test('latestDate는 정밀도가 섞여도 문자열 순서로 비교한다', () => {
	assert.equal(latestDate([{ date: '2026' }, { date: '2026-05' }, { date: '2025-12-31' }]), '2026-05');
});

test('byDateDesc는 최신 먼저, 날짜 없는 항목은 맨 뒤', () => {
	const items = [{ date: '2026-01-01' }, {}, { date: '2026-06-01' }, {}, { date: '2025-09-09' }];
	assert.deepEqual(
		[...items].sort(byDateDesc).map((x) => x.date),
		['2026-06-01', '2026-01-01', '2025-09-09', undefined, undefined],
	);
});
