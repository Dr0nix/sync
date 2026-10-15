// 검색엔진에 알릴 공개 페이지. 개인 결과(/result)와 SYNC 결과(/match)는 넣지 않는다.
import type { MetadataRoute } from 'next';
import { TYPE_IDS } from '@/lib/scoring/v1/prototypes.ts';
import { siteUrl } from '@/lib/site-url.ts';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/types`, changeFrequency: 'monthly', priority: 0.8 },
    ...TYPE_IDS.map(id => ({ url: `${base}/types/${id}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
