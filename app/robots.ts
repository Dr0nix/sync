// 검색엔진 수집 규칙.
// 검색 노출을 막을 페이지는 robots.txt가 아니라 각 페이지의 noindex로 막는다. robots.txt로 막으면 링크 미리보기 봇도 OG 태그와 공유 이미지를 읽지 못한다.
import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url.ts';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
