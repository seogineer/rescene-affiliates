// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://remine.fan',
  base: '/',
  // /appearances/는 메인 출연 탭으로 넘기는 페이지라 사이트맵에서 뺀다.
  integrations: [sitemap({ filter: (page) => !page.endsWith('/appearances/') })],
});