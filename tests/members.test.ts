import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MEMBERS, MEMBER_SLUG, memberFromSlug, forMember } from '../src/lib/members.ts';

test('memberFromSlug는 영문 주소를 멤버로 되돌린다', () => {
	for (const m of MEMBERS) assert.equal(memberFromSlug(MEMBER_SLUG[m]), m);
	assert.equal(memberFromSlug('nobody'), undefined);
});

test('forMember는 해당 멤버가 적힌 항목만 고르고 그룹 전체(빈 목록)는 뺀다', () => {
	const items = [{ n: 'a', members: ['원이'] }, { n: 'b', members: [] }, { n: 'c', members: ['원이', '제나'] }];
	assert.deepEqual(forMember(items, '원이').map((i) => i.n), ['a', 'c']);
	assert.deepEqual(forMember(items, '메이'), []);
});

import { mediaForMember } from '../src/lib/members.ts';

test('mediaForMember는 영상에 적힌 멤버를 따르고, 안 적힌 영상은 문서가 한 명일 때만 그 멤버로 본다', () => {
	const media = [{ t: 'a', members: ['리브'] }, { t: 'b', members: [] }, { t: 'c' }];
	assert.deepEqual(mediaForMember(media, [], '리브').map((m) => m.t), ['a']);
	assert.deepEqual(mediaForMember(media, ['원이'], '원이').map((m) => m.t), ['b', 'c']);
	assert.deepEqual(mediaForMember(media, ['원이'], '리브').map((m) => m.t), ['a']);
	assert.deepEqual(mediaForMember(media, ['원이', '미나미'], '원이'), []);
});
