import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clip, breadcrumbs, jsonLdString, xmlEscape } from '../src/lib/seo.ts';

test('clip은 짧은 글은 그대로, 긴 글은 150자 안으로 줄인다', () => {
	assert.equal(clip('짧은  글'), '짧은 글');
	const out = clip('가'.repeat(300));
	assert.ok(out.length <= 150 && out.endsWith('…'));
});

test('clip은 문장 끝에서 끊을 수 있으면 …을 붙이지 않는다', () => {
	const s = '리센느가 출연했다. ' + '나'.repeat(60) + '. ' + '다'.repeat(200);
	const out = clip(s, 100);
	assert.ok(out.endsWith('.') && !out.endsWith('…'));
});

test('breadcrumbs는 순서대로 position을 매긴다', () => {
	const b = breadcrumbs([{ name: 'a', url: 'https://x/' }, { name: 'b', url: 'https://x/b/' }]);
	assert.deepEqual(b.itemListElement.map((i) => i.position), [1, 2]);
});

test('jsonLdString은 </script>가 본문에서 닫히지 않게 한다', () => {
	assert.ok(!jsonLdString({ a: '</script><b>' }).includes('<'));
});

test('xmlEscape는 XML 특수문자를 바꾼다', () => {
	assert.equal(xmlEscape('a&b<c>"d"'), 'a&amp;b&lt;c&gt;&quot;d&quot;');
});
