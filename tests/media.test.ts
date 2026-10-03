import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mediaNoun } from '../src/lib/media.ts';

test('mediaNoun은 영상만 있으면 영상, 이미지가 하나라도 있으면 이미지·영상', () => {
	assert.equal(mediaNoun([{ kind: 'video' }, { kind: 'video' }]), '영상');
	assert.equal(mediaNoun([{ kind: 'image' }]), '이미지·영상');
	assert.equal(mediaNoun([{ kind: 'video' }, { kind: 'image' }]), '이미지·영상');
});

test('mediaNoun은 비어 있으면 이미지·영상 (준비 중 문구와 맞춘다)', () => {
	assert.equal(mediaNoun([]), '이미지·영상');
});
