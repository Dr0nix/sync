// 검색엔진 수집 규칙. 개인 결과·SYNC 결과·초대 화면·API는 수집하지 않게 한다.
// 링크 미리보기(카카오톡 등)는 robots와 별개로 동작하므로 공유에는 영향이 없다.
import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url.ts';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/result/', '/match/', '/i/', '/test'] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
