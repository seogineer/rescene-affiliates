import { test } from 'node:test';
import assert from 'node:assert/strict';
import { todayStart, parseCount, counterUrl, formatVisits } from '../src/lib/counter.ts';

test('todayStart는 GoatCounter 공개 카운터가 쓰는 UTC 날짜를 돌려준다 (한국 시간 오전 9시에 바뀐다)', () => {
	assert.equal(todayStart(new Date('2026-10-02T23:59:59Z')), '2026-10-02');
	assert.equal(todayStart(new Date('2026-10-03T00:00:00Z')), '2026-10-03');
	// 한국 시간 새벽 3시(UTC 전날 18시)에도 직전 오전 9시부터의 숫자를 보여준다
	assert.equal(todayStart(new Date('2026-10-02T18:00:00Z')), '2026-10-02');
});

test('parseCount는 쉼표가 있는 문자열도 숫자로 바꾸고, 이상한 값은 null', () => {
	assert.equal(parseCount('1,234'), 1234);
	assert.equal(parseCount('1\u202f234'), 1234);
	assert.equal(parseCount("1'234"), 1234);
	assert.equal(parseCount('1 234'), 1234);
	assert.equal(parseCount('0'), 0);
	assert.equal(parseCount(''), null);
	assert.equal(parseCount(undefined), null);
	assert.equal(parseCount('abc'), null);
});

test('counterUrl은 TOTAL.json 주소를 만들고, 시작일이 있으면 붙인다', () => {
	assert.equal(counterUrl('remine'), 'https://remine.goatcounter.com/counter/TOTAL.json');
	assert.equal(counterUrl('remine', '2026-10-03'), 'https://remine.goatcounter.com/counter/TOTAL.json?start=2026-10-03');
});

test('formatVisits는 둘 다 있으면 오늘·전체를, 전체만 있으면 전체만, 없으면 null', () => {
	assert.equal(formatVisits(128, 4512), '오늘 128 · 전체 4,512');
	assert.equal(formatVisits(null, 4512), '전체 4,512');
	assert.equal(formatVisits(128, null), null);
	assert.equal(formatVisits(null, null), null);
});
