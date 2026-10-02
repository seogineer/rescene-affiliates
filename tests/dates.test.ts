import { test } from 'node:test';
import assert from 'node:assert/strict';
import { latestDate, byDateDesc, toDateString, byLatestThenName } from '../src/lib/dates.ts';

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

test('toDateString은 YAML이 읽은 숫자·Date·문자열을 같은 문자열 형식으로 바꾼다', () => {
	assert.equal(toDateString(2026), '2026');
	assert.equal(toDateString('2026-05'), '2026-05');
	assert.equal(toDateString(new Date('2026-05-03')), '2026-05-03');
});

test('byLatestThenName은 최근 출연일이 같으면 이름 가나다순, 날짜 없으면 맨 뒤', () => {
	const items = [
		{ latest: '2026-07-14', name: '한해의 키스 더 라디오' },
		{ latest: undefined, name: '가나다' },
		{ latest: '2026-07-14', name: '더쇼' },
		{ latest: '2026-08-01', name: '하하' },
	];
	assert.deepEqual(
		[...items].sort(byLatestThenName).map((x) => x.name),
		['하하', '더쇼', '한해의 키스 더 라디오', '가나다'],
	);
});
