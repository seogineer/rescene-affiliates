import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tabFromHash } from '../src/lib/tabs.ts';

test('tabFromHash는 #appearances면 출연 탭을 고른다', () => {
	assert.equal(tabFromHash('#appearances'), 'appearances');
});

test('tabFromHash는 해시가 없거나 모르는 값이면 기업 탭을 고른다', () => {
	assert.equal(tabFromHash(''), 'sponsors');
	assert.equal(tabFromHash('#sponsors'), 'sponsors');
	assert.equal(tabFromHash('#q'), 'sponsors');
	assert.equal(tabFromHash('#APPEARANCES'), 'sponsors');
});
