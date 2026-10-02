import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { toDateString } from './lib/dates';

const dateStr = z.union([z.string(), z.number(), z.date()]).transform(toDateString);

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
