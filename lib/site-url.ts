// 사이트 기준 주소. og:url·og:image 같은 메타데이터를 절대 주소로 만드는 데 쓴다.
// SITE_URL → Vercel이 주는 운영 주소 → 이번 배포 주소 → 로컬 순으로 찾는다.
export function siteUrl(): string {
  const { SITE_URL, VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL } = process.env;
  if (SITE_URL) return SITE_URL;
  if (VERCEL_PROJECT_PRODUCTION_URL) return `https://${VERCEL_PROJECT_PRODUCTION_URL}`;
  if (VERCEL_URL) return `https://${VERCEL_URL}`;
  return 'http://localhost:3000';
}
