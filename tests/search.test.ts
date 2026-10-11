import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chosung, search, type Entry } from '../src/lib/search.ts';

const e = (name: string, aliases = '', text = ''): Entry => ({ name, kind: '출연', url: '/' + name, text, aliases });
const data = [e('인기가요', 'inkigayo 입크'), e('쇼! 음악중심', 'music core 쇼음중'), e('아는 형님', '아형 knowing bros'), e('MLB', '', '리브 미나미 메이 제나')];

test('chosung은 한글만 초성으로 바꾼다', () => {
	assert.equal(chosung('인기가요 MLB'), 'ㅇㄱㄱㅇ MLB');
});

test('초성·영문 별칭·공백 무시로 찾는다', () => {
	assert.equal(search('ㅇㄱㄱㅇ', data)[0].name, '인기가요');
	assert.equal(search('Music  Core', data)[0].name, '쇼! 음악중심');
	assert.equal(search('아형', data)[0].name, '아는 형님');
	assert.equal(search('쇼음악', data)[0].name, '쇼! 음악중심');
});

test('이름이 본문보다 먼저, 일치하지 않으면 빈 결과', () => {
	assert.deepEqual(search('제나', data).map((x) => x.name), ['MLB']);
	assert.deepEqual(search('없는말', data), []);
	assert.deepEqual(search('', data), []);
});
