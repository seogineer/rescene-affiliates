# 출연 섹션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 리센느가 출연한 유튜브 채널·웹예능, TV 예능, 라디오, 음악방송을 기록하는 '출연' 섹션(목록·상세 페이지, 메뉴, 제보 양식, 첫 데이터)을 추가한다.

**Architecture:** 기존 `sponsors`와 나란히 별도 Astro 콘텐츠 컬렉션 `appearances`를 만든다. `media` 항목 스키마는 공통 상수로 뽑아 두 컬렉션이 함께 쓴다. 정렬용 날짜 계산은 의존성 없는 순수 모듈(`src/lib/dates.ts`)에 두고 Node 내장 테스트 러너로 검증한다. 페이지는 기존 기업 목록·상세의 마크업과 CSS 클래스를 재사용한다.

**Tech Stack:** Astro 7 (content collections, `astro/zod`), TypeScript, Node 24 (`node --test`, 타입 스트리핑), GitHub Pages, GitHub Issue Forms

**Spec:** `docs/superpowers/specs/2026-10-02-appearances-design.md`

## Global Constraints

- 종류 값은 정확히 `유튜브·웹예능`, `TV 예능`, `라디오`, `음악방송` 네 가지(가운뎃점은 U+00B7 `·`).
- `sources`는 1개 이상 필수, 오류 메시지는 `'출처를 1개 이상 적어주세요'`(기업과 동일).
- 미디어는 게시물 링크만. 영상은 방송사·채널 **공식 업로드**만. 팬 재업로드·짜깁기 금지. 나무위키는 출처로 쓰지 않는다.
- 확인 안 된 내용은 `확인필요`로 표시하고 추측하지 않는다.
- 기존 기업 데이터(`src/content/sponsors/*.yaml`)의 형식과 내용은 바꾸지 않는다.
- 사이트 이름 "리센느 계열사"는 유지한다. 메인의 주인공은 기업이다.
- 내부 링크는 반드시 `url()` (`src/config.ts`)로 만든다.
- 커밋 메시지 끝에는 아래 두 줄을 붙인다.
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01CsdnX6JhCwaNDxEoEdDQHk
  ```

## Review Focus

- **날짜가 없는 출연 문서·회차**: 목록에서는 맨 뒤로 가야 하고, 카드에는 날짜 대신 `영상 N개`만 보여야 한다. 회차가 0개인 문서도 깨지지 않아야 한다. → Task 2의 테스트와 Task 3의 빈 문서 확인.
- **날짜 정밀도가 섞인 경우** (`2026`, `2026-05`, `2026-05-03`): YAML이 `2026`을 숫자로, `2026-05-03`을 Date로 읽어도 문자열로 통일돼서 순서가 맞아야 한다. → Task 1(`dateStr` 재사용)과 Task 2의 테스트.
- **모바일 헤더**: 720px 이하에서는 지금 `cta`를 뺀 메뉴 링크가 모두 숨겨진다. 새 `기업`·`출연` 링크는 휴대폰에서도 보여야 한다. → Task 5의 CSS와 확인 단계.
- **모바일 통계 칸**: 통계가 3칸이 되면 모바일 2열 그리드에서 한 칸이 줄바꿈된다. → Task 5에서 3열로 바꾼다.
- **필터 결과가 0개일 때**: "결과 없음" 안내와 출연 제보 링크가 보여야 한다. 종류 칩은 데이터에 있는 종류만 나와야 한다. → Task 3의 확인 단계.

---

## File Structure

| 파일 | 역할 |
|---|---|
| `src/content.config.ts` (수정) | `media` 공통 스키마 추출, `appearances` 컬렉션 추가 |
| `src/lib/dates.ts` (생성) | 의존성 없는 날짜 정렬 함수 `latestDate`, `byDateDesc` |
| `tests/dates.test.ts` (생성) | `dates.ts` 단위 테스트 (`node --test`) |
| `src/lib/appearances.ts` (생성) | `getAppearances()`: 정렬, 최근 출연일, 커버, 톤 |
| `src/pages/appearances/index.astro` (생성) | 출연 목록, 검색, 종류 필터 |
| `src/pages/appearances/[slug].astro` (생성) | 출연 상세 |
| `src/layouts/Base.astro` (수정) | 헤더에 `기업`·`출연` 링크 추가 |
| `src/pages/index.astro` (수정) | 통계 `출연 N`, 최근 출연 3개, 설명 문구 |
| `src/pages/about.astro` (수정) | 소개 문구 |
| `src/styles/global.css` (수정) | 모바일 메뉴, 통계 3열, `.more` 링크 |
| `.github/ISSUE_TEMPLATE/new-appearance.yml` (생성) | 출연 제보 양식 |
| `.github/ISSUE_TEMPLATE/add-media.yml` (수정) | 대상 문서 설명 확장 |
| `CONTRIBUTING.md`, `README.md` (수정) | 출연 추가 안내 |
| `package.json`, `.github/workflows/check.yml` (수정) | `npm test` 스크립트와 CI 단계 |
| `src/content/appearances/*.yaml` (생성) | 실제 출연 데이터 |

---

### Task 1: `appearances` 컬렉션 스키마

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content/appearances/_draft-check.yaml` (임시, 이 Task 안에서 지움)
- Create: `src/content/appearances/music-core.yaml` (실제 데이터 1건. Task 6에서 내용을 확인·보강한다)

**Interfaces:**
- Produces: 컬렉션 이름 `appearances`. `entry.data`는 `{ name: string; summary: string; category: '유튜브·웹예능' | 'TV 예능' | '라디오' | '음악방송'; broadcaster?: string; website?: string; sources: {title: string; url: string}[]; media: { kind: 'image'|'video'; platform: 'youtube'|'instagram'|'x'|'tiktok'|'web'; url: string; title: string; orientation: 'landscape'|'portrait'; date?: string }[] }`
- Produces: `src/content.config.ts`에서 export하는 `APPEARANCE_CATEGORIES` (readonly 튜플)

- [ ] **Step 1: 실패해야 하는 임시 데이터 넣기**

`src/content/appearances/_draft-check.yaml`:
```yaml
name: "스키마 검사용"
summary: "출처가 없으므로 검사에 실패해야 한다."
category: TV 예능
sources: []
```

- [ ] **Step 2: 아직 컬렉션이 없으니 그냥 무시되는 것 확인**

Run: `npx astro check 2>&1 | tail -3`
Expected: 오류 0. 컬렉션이 정의되지 않아 파일이 무시된다. 이 단계는 다음 단계의 실패가 스키마 때문이라는 걸 보이기 위한 기준선이다.

- [ ] **Step 3: 스키마 구현**

`src/content.config.ts` 전체를 다음으로 바꾼다.
```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// YAML은 따옴표 없는 2025-01-01을 Date로, 2025를 숫자로 읽으므로 모두 받아 문자열로 통일한다.
const dateStr = z
	.union([z.string(), z.number(), z.date()])
	.transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v)));

// 출처는 필수. 나무위키처럼 근거 없는 내용은 받지 않는다.
const sources = z
	.array(z.object({ title: z.string(), url: z.url() }))
	.min(1, '출처를 1개 이상 적어주세요');

// 이미지/영상은 파일이나 CDN 주소가 아닌 "게시물 링크"만 저장한다. 기업과 출연이 같은 형식을 쓴다.
const media = z
	.array(
		z.object({
			kind: z.enum(['image', 'video']),
			platform: z.enum(['youtube', 'instagram', 'x', 'tiktok', 'web']),
			url: z.url(),
			title: z.string(),
			// 유튜브 쇼츠 같은 세로 영상은 portrait로 적으면 세로 비율로 보여준다.
			orientation: z.enum(['landscape', 'portrait']).default('landscape'),
			date: dateStr.optional(),
		}),
	)
	.default([]);

const sponsors = defineCollection({
	loader: glob({ pattern: '**/*.yaml', base: './src/content/sponsors' }),
	schema: z.object({
		name: z.string(),
		// true면 예시 데이터. 실제 자료를 넣을 때는 이 줄을 지운다.
		sample: z.boolean().default(false),
		summary: z.string(),
		type: z.enum(['광고모델', '앰버서더', '협찬', '콜라보', '스폰서십', '기타']),
		status: z.enum(['진행중', '종료', '확인필요']),
		startDate: dateStr.optional(), // YYYY-MM 또는 YYYY-MM-DD
		endDate: dateStr.optional(),
		website: z.url().optional(),
		sources,
		media,
	}),
});

export const APPEARANCE_CATEGORIES = ['유튜브·웹예능', 'TV 예능', '라디오', '음악방송'] as const;

// 출연은 채널·프로그램 하나가 문서 하나이고, 출연 회차는 media에 담는다.
const appearances = defineCollection({
	loader: glob({ pattern: '**/*.yaml', base: './src/content/appearances' }),
	schema: z.object({
		name: z.string(),
		summary: z.string(),
		category: z.enum(APPEARANCE_CATEGORIES),
		broadcaster: z.string().optional(), // 방송사나 채널 운영자
		website: z.url().optional(),
		sources,
		media,
	}),
});

export const collections = { sponsors, appearances };
```

- [ ] **Step 4: 임시 데이터가 스키마 검사에 실패하는지 확인**

Run: `npm run build 2>&1 | grep -E "출처를 1개 이상|InvalidContentEntryDataError" | head -3`
Expected: `출처를 1개 이상 적어주세요` 오류가 출력되고 빌드가 실패한다.

- [ ] **Step 5: 임시 파일을 지우고 실제 데이터 1건 넣기**

`rm src/content/appearances/_draft-check.yaml`

`src/content/appearances/music-core.yaml`을 만든다. 출연 사실, 날짜, 영상은 **반드시 원문으로 확인한 값**만 넣는다. 확인 방법은 Task 6 Step 1과 같다. 형식은 다음과 같다.
```yaml
name: "쇼! 음악중심"
summary: "MBC 음악방송. 리센느가 컴백 무대를 선보였다."
category: 음악방송
broadcaster: MBC
website: https://program.imbc.com/musiccore
sources:
  - title: "<기사 제목> (<매체>, <YYYY-MM-DD>)"
    url: <기사 URL>
media:
  - kind: video
    platform: youtube
    url: <MBCkpop 공식 채널의 리센느 무대 영상 URL>
    title: "<영상 제목 그대로>"
    date: <방송일 YYYY-MM-DD>
```
꺾쇠 자리는 확인한 실제 값으로 채운다. 확인한 영상이 없으면 `media`를 비우고 요약에 `확인필요`를 적는다.

- [ ] **Step 6: 검사 통과 확인**

Run: `npx astro check 2>&1 | tail -3 && npm run build 2>&1 | tail -2`
Expected: `0 errors`, `Complete!`. 기업 페이지 수는 그대로다(`dist/sponsors/` 아래 21개).

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/content/appearances/music-core.yaml
git commit -m "Add appearances collection with shared media schema"
```

---

### Task 2: 날짜 정렬 함수와 테스트

**Files:**
- Create: `src/lib/dates.ts`
- Create: `tests/dates.test.ts`
- Modify: `package.json` (scripts에 `test` 추가)
- Modify: `.github/workflows/check.yml` (`npm test` 단계 추가)

**Interfaces:**
- Produces: `latestDate(items: { date?: string }[]): string | undefined`
- Produces: `byDateDesc(a: { date?: string }, b: { date?: string }): number`. 최신이 먼저 오고, 날짜가 없으면 맨 뒤로 간다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/dates.test.ts`:
```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `node --test tests/`
Expected: FAIL. `Cannot find module .../src/lib/dates.ts`

- [ ] **Step 3: 구현**

`src/lib/dates.ts`:
```ts
// 날짜는 스키마에서 YYYY, YYYY-MM, YYYY-MM-DD 문자열로 통일되므로 문자열 비교로 순서가 맞다.
// 테스트를 node로 바로 돌릴 수 있게 이 파일은 아무것도 import하지 않는다.
type Dated = { date?: string };

export function latestDate(items: Dated[]): string | undefined {
	let max: string | undefined;
	for (const { date } of items) if (date && (!max || date > max)) max = date;
	return max;
}

/** 최신 먼저, 날짜가 없는 항목은 맨 뒤. */
export function byDateDesc(a: Dated, b: Dated): number {
	if (!a.date) return b.date ? 1 : 0;
	if (!b.date) return -1;
	return b.date.localeCompare(a.date);
}
```

- [ ] **Step 4: 통과 확인**

Run: `node --test tests/`
Expected: `# pass 4`, `# fail 0`

- [ ] **Step 5: npm 스크립트와 CI 연결**

`package.json`의 `scripts`에 `"test": "node --test tests/"`를 추가한다.

`node:test` 타입은 지금 `@astrojs/sitemap`의 간접 의존성으로만 들어와 있어서 직접 추가한다: `npm i -D @types/node@24`

`.github/workflows/check.yml`의 `- run: npx astro check` 바로 위에 `- run: npm test`를 추가한다.

Run: `npm test 2>&1 | grep -E "^# (pass|fail)" && npx astro check 2>&1 | tail -2`
Expected: `# pass 4`, `# fail 0`, 그리고 astro check 오류 0. `tests/`도 타입 검사 대상이다.

- [ ] **Step 6: Commit**

```bash
git add src/lib/dates.ts tests/dates.test.ts package.json package-lock.json .github/workflows/check.yml
git commit -m "Add date sorting helpers with node tests"
```

---

### Task 3: `getAppearances()`와 출연 목록 페이지

**Files:**
- Create: `src/lib/appearances.ts`
- Create: `src/pages/appearances/index.astro`

**Interfaces:**
- Consumes: 컬렉션 `appearances` (Task 1), `latestDate`, `byDateDesc` (Task 2), `youtubeId`, `ytThumb` (`src/lib/youtube.ts`), `url`, `newIssueUrl` (`src/config.ts`)
- Produces: `getAppearances(): Promise<Array<{ entry: CollectionEntry<'appearances'>; media: Media[]; latest: string | undefined; cover: string | null; tone: number }>>`. `media`는 날짜 최신순으로 정렬된 회차 목록이고, 배열 전체는 `latest` 기준 최신순이다.

- [ ] **Step 1: `getAppearances` 구현**

`src/lib/appearances.ts`:
```ts
import { getCollection } from 'astro:content';
import { youtubeId } from './youtube';
import { latestDate, byDateDesc } from './dates';

/** 목록·상세·메인이 같은 순서(최근 출연일 먼저)를 쓰도록 한 곳에서 만든다. */
export async function getAppearances() {
	const all = await getCollection('appearances');
	const items = all.map((entry) => {
		const media = [...entry.data.media].sort(byDateDesc);
		// 가장 최근 유튜브 회차의 썸네일을 카드 커버로 쓴다.
		const cover = media
			.filter((m) => m.platform === 'youtube')
			.map((m) => youtubeId(m.url))
			.find(Boolean);
		return { entry, media, latest: latestDate(media), cover: cover ?? null };
	});
	items.sort(
		(a, b) => byDateDesc({ date: a.latest }, { date: b.latest }) || a.entry.data.name.localeCompare(b.entry.data.name, 'ko'),
	);
	return items.map((item, i) => ({ ...item, tone: i % 3 }));
}
```

- [ ] **Step 2: 목록 페이지 작성**

`src/pages/appearances/index.astro`:
```astro
---
import Base from '../../layouts/Base.astro';
import { url, newIssueUrl } from '../../config';
import { getAppearances } from '../../lib/appearances';
import { ytThumb } from '../../lib/youtube';
import { APPEARANCE_CATEGORIES } from '../../content.config';
const items = await getAppearances();
// 데이터에 있는 종류만 칩으로 보여준다.
const categories = APPEARANCE_CATEGORIES.filter((c) => items.some(({ entry }) => entry.data.category === c));
---
<Base title="출연" description="리센느가 출연한 유튜브 채널·웹예능, TV 예능, 라디오, 음악방송을 팬들이 함께 기록합니다.">
	<div class="sec-head">
		<h2><small>Scenes on screen</small>출연</h2>
		<p>최근 출연한 순서</p>
	</div>
	<div class="filters" role="search">
		<input id="q" type="search" placeholder="프로그램·채널 검색" aria-label="출연 검색" />
		<div class="chips" id="cat-chips">
			<button type="button" class="chip on" data-cat="">전체</button>
			{categories.map((c) => <button type="button" class="chip" data-cat={c}>{c}</button>)}
		</div>
	</div>
	<p id="empty" class="meta" hidden>조건에 맞는 출연이 없습니다. <a href={newIssueUrl('new-appearance.yml')}>출연 제보하기</a></p>
	<div class="grid" id="grid">
		{items.map(({ entry: a, media, latest, cover, tone }) => (
			<article class="card" data-cat={a.data.category} data-text={`${a.data.name} ${a.data.broadcaster ?? ''} ${a.data.summary}`.toLowerCase()}>
				{cover ? (
					<div class="cover"><img src={ytThumb(cover)} alt="" loading="lazy" /></div>
				) : (
					<div class={`cover blank tone-${tone}`}>{a.data.name.slice(0, 1)}</div>
				)}
				<div class="card-body">
					<div class="badges">
						<span class="badge">{a.data.category}</span>
						{a.data.broadcaster && <span class="badge">{a.data.broadcaster}</span>}
					</div>
					<h3><a class="stretch" href={url(`appearances/${a.id}/`)}>{a.data.name}</a></h3>
					<p>{a.data.summary}</p>
					<div class="meta">
						{latest && <>최근 {latest} · </>}
						{media.length > 0 ? `영상 ${media.length}개` : '영상 준비 중'}
					</div>
				</div>
			</article>
		))}
	</div>

	<script>
		const q = document.querySelector<HTMLInputElement>('#q')!;
		const chips = [...document.querySelectorAll<HTMLButtonElement>('#cat-chips .chip')];
		const cards = [...document.querySelectorAll<HTMLElement>('#grid .card')];
		const empty = document.querySelector<HTMLElement>('#empty')!;
		let cat = '';
		function apply() {
			const text = q.value.trim().toLowerCase();
			let shown = 0;
			for (const c of cards) {
				const ok = (!cat || c.dataset.cat === cat) && (!text || c.dataset.text!.includes(text));
				c.hidden = !ok;
				if (ok) shown++;
			}
			empty.hidden = shown > 0;
		}
		q.addEventListener('input', apply);
		for (const b of chips) {
			b.addEventListener('click', () => {
				cat = b.dataset.cat ?? '';
				chips.forEach((x) => x.classList.toggle('on', x === b));
				apply();
			});
		}
	</script>

	<section class="contribute">
		<div>
			<h2>함께 기록해 주세요</h2>
			<p>빠진 출연이나 회차 영상이 있으면 제보해 주세요. 방송사·채널 공식 영상만 받습니다.</p>
		</div>
		<div class="actions">
			<a class="btn" href={newIssueUrl('new-appearance.yml')}>출연 제보</a>
			<a class="btn ghost" href={newIssueUrl('add-media.yml')}>영상 제보</a>
		</div>
	</section>
</Base>
```

- [ ] **Step 3: 빌드하고 결과물 확인**

Run:
```bash
npx astro check 2>&1 | tail -2 && npm run build 2>&1 | tail -1 && \
grep -c 'class="card"' dist/appearances/index.html && \
grep -o 'data-cat="[^"]*"' dist/appearances/index.html | sort | uniq -c && \
grep -c 'appearances/' dist/sitemap-0.xml
```
Expected: 오류 0, `Complete!`, 카드 1개 이상, 칩에는 데이터에 있는 종류만 있고, 사이트맵에 `appearances/`가 포함된다.

- [ ] **Step 4: 날짜 없는 문서와 빈 결과 확인 (임시 파일)**

`src/content/appearances/_tmp-nodate.yaml`:
```yaml
name: "임시 확인용"
summary: "날짜 없음"
category: 라디오
sources:
  - title: "임시"
    url: https://example.com
```
Run: `npm run build 2>&1 | tail -1 && grep -o '<h3>.*</h3>' dist/appearances/index.html | sed 's/<[^>]*>//g'`
Expected: 빌드가 성공하고, `임시 확인용`이 **맨 마지막**에 나온다. 그다음 `npm run dev`로 띄워 `/appearances/`에서 아래를 확인한다.
- 검색창에 `없는말`을 입력하면 "조건에 맞는 출연이 없습니다"와 제보 링크가 보인다.
- `라디오` 칩을 누르면 임시 카드만 남는다.

확인했으면 `rm src/content/appearances/_tmp-nodate.yaml`로 지운다.

- [ ] **Step 5: Commit**

```bash
git add src/lib/appearances.ts src/pages/appearances/index.astro
git commit -m "Add appearances list page with search and category filter"
```

---

### Task 4: 출연 상세 페이지

**Files:**
- Create: `src/pages/appearances/[slug].astro`

**Interfaces:**
- Consumes: `getAppearances()` (Task 3), `MediaCard` (`src/components/MediaCard.astro`, props는 media 항목 그대로), `editUrl`, `newIssueUrl`, `url`, `ytThumb`

- [ ] **Step 1: 상세 페이지 작성**

`src/pages/appearances/[slug].astro`:
```astro
---
import Base from '../../layouts/Base.astro';
import MediaCard from '../../components/MediaCard.astro';
import { url, editUrl, newIssueUrl } from '../../config';
import { getAppearances } from '../../lib/appearances';
import { ytThumb } from '../../lib/youtube';

export async function getStaticPaths() {
	const items = await getAppearances();
	return items.map((item) => ({ params: { slug: item.entry.id }, props: item }));
}
const { entry, media, latest, cover, tone } = Astro.props;
const d = entry.data;
---
<Base title={d.name} description={d.summary} image={cover ? ytThumb(cover) : undefined}>
	<a class="back" href={url('appearances/')}>← 출연 목록</a>
	<div class="detail-head has-cover">
		<div>
			<h1>{d.name}</h1>
			<div class="badges">
				<span class="badge">{d.category}</span>
				{d.broadcaster && <span class="badge">{d.broadcaster}</span>}
			</div>
			<p class="desc">{d.summary}</p>
			<div class="meta">
				{latest && <>최근 출연 {latest}</>}
				{latest && d.website && ' · '}
				{d.website && <a href={d.website} target="_blank" rel="noopener noreferrer">공식 페이지 ↗</a>}
			</div>
			<a class="edit" href={editUrl(entry.filePath!)} target="_blank" rel="noopener noreferrer">✏️ 이 문서 편집</a>
		</div>
		{cover ? (
			<div class="cover"><img src={ytThumb(cover)} alt="" /></div>
		) : (
			<div class={`cover blank tone-${tone}`}>{d.name.slice(0, 1)}</div>
		)}
	</div>

	<h2 class="sec">출연 영상</h2>
	{media.length === 0 ? (
		<p class="meta">아직 기록된 영상이 없습니다. <a href={newIssueUrl('add-media.yml')}>영상 제보하기</a></p>
	) : (
		<div class="media-grid">{media.map((m) => <MediaCard {...m} />)}</div>
	)}

	<h2 class="sec">출처</h2>
	<ol class="sources">
		{d.sources.map((s) => <li><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}
	</ol>
</Base>
```

- [ ] **Step 2: 빌드하고 결과물 확인**

Run:
```bash
npx astro check 2>&1 | tail -2 && npm run build 2>&1 | tail -1 && \
ls dist/appearances/ && \
grep -o 'href="https://github.com/seogineer/rescene-affiliates/edit/main/src/content/appearances/[^"]*"' dist/appearances/music-core/index.html && \
grep -o '<link rel="canonical"[^>]*>' dist/appearances/music-core/index.html
```
Expected: 오류 0, `music-core/` 폴더가 있다. 편집 링크가 `src/content/appearances/music-core.yaml`을 가리키고, canonical은 `https://remine.fan/appearances/music-core/`이다.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/appearances/[slug].astro"
git commit -m "Add appearance detail page"
```

---

### Task 5: 메뉴·메인·소개·제보 양식·문서 연결

**Files:**
- Modify: `src/layouts/Base.astro` (헤더 nav)
- Modify: `src/pages/index.astro` (설명, 통계, 최근 출연 섹션)
- Modify: `src/pages/about.astro`
- Modify: `src/styles/global.css`
- Create: `.github/ISSUE_TEMPLATE/new-appearance.yml`
- Modify: `.github/ISSUE_TEMPLATE/add-media.yml`
- Modify: `CONTRIBUTING.md`, `README.md`

**Interfaces:**
- Consumes: `getAppearances()` (Task 3), 이슈 양식 파일명 `new-appearance.yml` (Task 3의 링크가 이 이름을 쓴다)

- [ ] **Step 1: 헤더 메뉴**

`src/layouts/Base.astro`의 `<nav>` 첫 줄 앞에 다음을 추가한다.
```astro
					<a class="sec-link" href={url()}>기업</a>
					<a class="sec-link" href={url('appearances/')}>출연</a>
```

`src/styles/global.css`의 `@media (max-width: 720px)` 블록에서 아래 줄을
```css
	header.site nav a:not(.cta) { display: none; }
```
다음으로 바꾼다. 섹션 링크는 휴대폰에서도 남긴다.
```css
	header.site nav a:not(.cta, .sec-link) { display: none; }
	header.site nav a { padding: 7px 10px; }
```
같은 블록의 `.stats { display: grid; grid-template-columns: repeat(2, 1fr); ...}`에서 `repeat(2, 1fr)`을 `repeat(3, 1fr)`로 바꾼다.

블록 바깥의 `.btn.ghost` 줄 아래에 메인의 "전체 보기" 링크 스타일을 추가한다.
```css
.more { display: inline-block; margin-top: 18px; font-weight: 600; text-decoration: none; color: var(--rose); }
```

- [ ] **Step 2: 메인 페이지**

`src/pages/index.astro`를 아래처럼 바꾼다.
- import에 `import { getAppearances } from '../lib/appearances';`를 추가한다.
- `const items = await getSponsors();` 아래에 `const appearances = await getAppearances();`를 추가한다.
- `<p class="lead">` 문구를 `리센느와 함께한 기업과 출연 프로그램, 그리고 공개된 이미지·영상을 팬들이 함께 기록합니다.`로 바꾼다.
- `.stats` 안 `진행 중` 칸 뒤에 다음을 추가한다.
```astro
			<div class="stat"><b>{appearances.length}</b><span>출연</span></div>
```
- 기업 검색 `<script>...</script>` 바로 뒤, `<section class="contribute">` 앞에 다음을 추가한다.
```astro
	{appearances.length > 0 && (
		<>
			<div class="sec-head">
				<h2><small>Scenes on screen</small>최근 출연</h2>
				<p>유튜브·예능·라디오·음악방송</p>
			</div>
			<div class="grid">
				{appearances.slice(0, 3).map(({ entry: a, media, latest, cover, tone }) => (
					<article class="card">
						{cover ? (
							<div class="cover"><img src={ytThumb(cover)} alt="" loading="lazy" /></div>
						) : (
							<div class={`cover blank tone-${tone}`}>{a.data.name.slice(0, 1)}</div>
						)}
						<div class="card-body">
							<div class="badges"><span class="badge">{a.data.category}</span></div>
							<h3><a class="stretch" href={url(`appearances/${a.id}/`)}>{a.data.name}</a></h3>
							<p>{a.data.summary}</p>
							<div class="meta">
								{latest && <>최근 {latest} · </>}
								{media.length > 0 ? `영상 ${media.length}개` : '영상 준비 중'}
							</div>
						</div>
					</article>
				))}
			</div>
			<a class="more" href={url('appearances/')}>출연 전체 보기 →</a>
		</>
	)}
```
- `contribute` 섹션의 `<p>` 문구를 `잘못된 내용은 각 문서의 ✏️ 편집으로 고치고, 새 기업·출연이나 이미지·영상은 제보해 주세요.`로 바꾼다. `actions`에 `<a class="btn ghost" href={newIssueUrl('new-appearance.yml')}>출연 제보</a>`를 `기업 제보` 버튼 뒤에 추가한다.

- [ ] **Step 3: 소개 페이지**

`src/pages/about.astro`:
- 첫 문단 `리센느와 함께한 기업, 그리고 기업이 공개한 이미지·영상을`을 `리센느와 함께한 기업과 출연한 유튜브·예능·라디오·음악방송, 그리고 공개된 이미지·영상을`로 바꾼다.
- 기록 원칙 목록 끝에 `<li>출연 영상은 방송사·채널의 <strong>공식 업로드</strong>만 연결합니다. 팬 재업로드나 짜깁기 영상은 넣지 않습니다.</li>`를 추가한다.
- "함께 만들기" 문단의 `<a href={newIssueUrl('new-sponsor.yml')}>기업 제보</a>나` 뒤에 ` <a href={newIssueUrl('new-appearance.yml')}>출연 제보</a>,`를 넣는다. 결과 문구는 "기업 제보나 출연 제보, 이미지·영상 제보를 남겨주세요"가 된다. 조사가 자연스럽게 이어지는지 확인한다.

- [ ] **Step 4: 이슈 양식**

`.github/ISSUE_TEMPLATE/new-appearance.yml`:
```yaml
name: 출연 제보
description: 리센느가 출연한 유튜브 채널·예능·라디오·음악방송을 제보합니다
title: "[출연] "
labels: ["제보"]
body:
  - type: input
    id: name
    attributes: { label: 프로그램·채널 이름 }
    validations: { required: true }
  - type: dropdown
    id: category
    attributes:
      label: 종류
      options: [유튜브·웹예능, TV 예능, 라디오, 음악방송]
    validations: { required: true }
  - type: input
    id: broadcaster
    attributes: { label: 방송사·채널, description: "예: MBC, KBS Kpop, 채널 이름" }
  - type: textarea
    id: media
    attributes:
      label: 출연 영상 링크
      description: 방송사·채널이 올린 공식 영상 주소만 적어주세요. 팬 재업로드는 받지 않습니다.
  - type: textarea
    id: source
    attributes:
      label: 출처 링크 (필수)
      description: 기사, 공식 SNS 게시물 등 출연 사실을 확인할 수 있는 링크를 적어주세요.
    validations: { required: true }
  - type: textarea
    id: note
    attributes: { label: 기타 설명 }
```

`.github/ISSUE_TEMPLATE/add-media.yml`에서:
- `description: 기업이 올린 리센느 관련 게시물 링크를 제보합니다`를 `description: 기업·방송사·채널이 올린 리센느 관련 게시물 링크를 제보합니다`로 바꾼다.
- `attributes: { label: 기업명 }`을 `attributes: { label: 기업명 또는 프로그램·채널 이름 }`으로 바꾼다.

- [ ] **Step 5: CONTRIBUTING.md와 README.md**

`CONTRIBUTING.md`:
- 첫 문단 `기업별 YAML 파일 하나씩으로`를 `기업별(src/content/sponsors/), 출연 프로그램·채널별(src/content/appearances/) YAML 파일 하나씩으로`로 바꾼다.
- "## 새 기업 추가하기" 섹션 뒤에 다음을 추가한다.
```markdown
## 새 출연 추가하기
`src/content/appearances/프로그램-영문이름.yaml` 파일을 새로 만들고 `music-core.yaml` 형식을 따라주세요.
채널·프로그램 하나가 파일 하나이고, 출연 회차 영상은 `media`에 하나씩 추가합니다. `category`는 `유튜브·웹예능`, `TV 예능`, `라디오`, `음악방송` 중 하나입니다.
파일이 부담스럽다면 [출연 제보 이슈](../../issues/new?template=new-appearance.yml)를 남겨주세요.
```
- "## 규칙" 목록 끝에 `- **출연 영상은 공식 업로드만**: 방송사·채널이 올린 영상만 넣고, 팬 재업로드나 짜깁기 영상은 넣지 않습니다.`를 추가한다.

`README.md`:
- 2번째 줄 인용 `> 리센느와 함께한 기업 위키`를 `> 리센느와 함께한 기업·출연 위키`로 바꾼다.
- 소개 문단 `리센느와 함께한 기업, 그리고 기업이 공개한 이미지·영상 링크를`을 `리센느와 함께한 기업과 출연 프로그램, 그리고 공개된 이미지·영상 링크를`로 바꾼다.
- 표의 `| 새 기업 추가하기 | ... |` 줄 아래에 `| 새 출연 추가하기 | \`src/content/appearances/\` 에 파일 추가 후 PR |`를 추가한다.
- 표의 `파일이 부담스럽다면` 줄에서 `[기업 제보](...)` 뒤에 ` · [출연 제보](../../issues/new?template=new-appearance.yml)`를 넣는다.

- [ ] **Step 6: 확인**

Run:
```bash
npm test 2>&1 | grep -E "^# (pass|fail)" && npx astro check 2>&1 | tail -2 && npm run build 2>&1 | tail -1 && \
grep -o '<a class="sec-link"[^>]*>[^<]*' dist/index.html && \
grep -o '<span>출연</span>' dist/index.html && grep -c 'appearances/' dist/index.html && \
python3 -c "import yaml,sys;[yaml.safe_load(open(f)) for f in sys.argv[1:]];print('yaml ok')" .github/ISSUE_TEMPLATE/*.yml
```
Expected: 테스트 통과, 오류 0, 메뉴 링크 2개(`기업`, `출연`), 통계 `출연` 칸, 메인에 출연 링크가 있고 `yaml ok`가 출력된다.

그다음 `npm run dev`를 띄우고 브라우저 폭을 375px로 줄여서 확인한다.
- 헤더에 `기업`, `출연`, `기업 제보`가 한 줄로 보이고 로고와 겹치지 않는다.
- 통계 3칸이 한 줄에 들어간다.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/Base.astro src/pages/index.astro src/pages/about.astro src/styles/global.css .github/ISSUE_TEMPLATE CONTRIBUTING.md README.md
git commit -m "Link appearances from header, home, about and contribution docs"
```

---

### Task 6: 첫 출연 데이터 조사·입력

**Files:**
- Create: `src/content/appearances/<slug>.yaml` 여러 개 (총 10곳 안팎. Task 1의 `music-core.yaml` 포함)

**Interfaces:**
- Consumes: Task 1의 스키마, CONTRIBUTING.md 규칙

- [ ] **Step 1: 후보 수집과 원문 확인**

- 후보 단서: 나무위키 '리센느' 문서의 출연 목록, 방송사 공식 유튜브 채널(MBCkpop, KBS Kpop, SBS KPOP, Mnet K-POP, JTBC Entertainment 등), 소속사 공식 SNS 공지.
- 후보마다 아래 두 가지를 모두 확인해야 넣는다.
  1. **출연 사실과 날짜를 확인할 기사 또는 공식 게시물 URL**. 실제로 열어서 리센느 출연과 날짜를 확인한다.
  2. **영상 URL**이 방송사·채널 공식 계정의 업로드인지. 채널 이름을 확인한다.
- 나무위키 URL은 `sources`에 넣지 않는다.
- 종류별 목표는 대략 음악방송 3, TV 예능 2, 유튜브·웹예능 3, 라디오 2이다. 확인된 게 적은 종류는 억지로 채우지 않는다.

- [ ] **Step 2: 파일 작성**

- 파일명은 프로그램 영문 이름의 kebab-case로 한다(예: `music-bank.yaml`, `idol-radio.yaml`).
- 제목에 따옴표나 콜론이 있을 수 있으니 `title`과 `name`은 모두 큰따옴표로 감싼다.
- 영상 제목은 공식 업로드의 제목을 그대로 옮긴다. 세로 쇼츠면 `orientation: portrait`를 넣는다.
- 회차 날짜는 방송일(또는 업로드일)을 `YYYY-MM-DD`로 적는다. 확인하지 못했으면 `date`를 비운다.

- [ ] **Step 3: 검사**

Run: `npm test 2>&1 | grep -E "^# fail" && npx astro check 2>&1 | tail -2 && npm run build 2>&1 | tail -1 && ls dist/appearances/`
Expected: `# fail 0`, 오류 0, 각 슬러그 폴더가 있다.

`npm run dev`로 띄워서 아래를 확인한다.
- 목록 정렬이 최근 출연일 순인지
- 각 상세 페이지의 유튜브 임베드가 재생 가능한 상태인지("동영상을 재생할 수 없음"이 아닌지)
- 메인의 최근 출연 3개가 목록의 상위 3개와 같은지

- [ ] **Step 4: Commit**

```bash
git add src/content/appearances
git commit -m "Add researched RESCENE appearances with official videos"
```

---

### Task 7: 배포와 실제 사이트 확인

**Files:** 없음

- [ ] **Step 1: 푸시**

Run: `git push`

- [ ] **Step 2: 배포 대기와 확인**

Run:
```bash
gh run watch $(gh run list -L1 --json databaseId -q '.[0].databaseId') --exit-status >/dev/null; gh run list -L1
for p in appearances/ appearances/music-core/ ; do curl -s -o /dev/null -w "%{http_code} $p\n" https://remine.fan/$p; done
curl -s https://remine.fan/sitemap-0.xml | grep -o 'https://remine.fan/appearances/[^<]*' | head
```
Expected: 배포가 `success`이고, 두 주소 모두 `200`이며, 사이트맵에 출연 페이지가 들어 있다.
