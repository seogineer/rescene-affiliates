import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// YAML은 따옴표 없는 2025-01-01을 Date로 읽으므로, 문자열/Date 모두 받아 문자열로 통일한다.
const dateStr = z
	.union([z.string(), z.date()])
	.transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v));

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
		// 출처는 필수. 나무위키처럼 근거 없는 내용은 받지 않는다.
		sources: z
			.array(z.object({ title: z.string(), url: z.url() }))
			.min(1, '출처를 1개 이상 적어주세요'),
		// 이미지/영상은 파일이나 CDN 주소가 아닌 "게시물 링크"만 저장한다.
		media: z
			.array(
				z.object({
					kind: z.enum(['image', 'video']),
					platform: z.enum(['youtube', 'instagram', 'x', 'tiktok', 'web']),
					url: z.url(),
					title: z.string(),
					date: dateStr.optional(),
				}),
			)
			.default([]),
	}),
});

export const collections = { sponsors };
