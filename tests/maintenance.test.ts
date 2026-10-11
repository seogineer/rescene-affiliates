import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitPending, isPending } from '../src/lib/maintenance.ts';

test('splitPending은 일정이 지난 확인필요를 따로 모은다', () => {
	const docs = [
		{ summary: '확인필요', eventDate: '2026-10-09' },
		{ summary: '확인필요', eventDate: '2026-11-14' },
		{ summary: '확인필요' },
		{ summary: '끝', eventDate: '2026-10-01' },
		{ summary: 'x', status: '확인필요' },
	];
	const { overdue, waiting } = splitPending(docs, '2026-10-11');
	assert.equal(overdue.length, 1);
	assert.equal(waiting.length, 3);
	assert.equal(isPending(docs[3]), false);
});
