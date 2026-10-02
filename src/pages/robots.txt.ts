import type { APIRoute } from 'astro';

// 크롤러는 도메인 루트의 robots.txt만 읽는다. github.io 하위 경로에서는 무시되고,
// 커스텀 도메인을 연결하면 그대로 동작한다. sitemap 주소는 site/base를 따라간다.
export const GET: APIRoute = ({ site }) => {
	const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site);
	return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`);
};
