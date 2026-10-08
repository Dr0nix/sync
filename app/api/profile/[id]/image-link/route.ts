// POST /api/profile/[id]/image-link — 내 결과 이미지의 임시 주소를 발급한다. x-anonymous-token 헤더로 본인을 확인한다.
// 돌려주는 주소는 10분 동안만 유효하고 토큰을 담지 않는다.
import { imageLinkPath } from '@/lib/api/image-link.ts';
import { isUuid } from '@/lib/api/submit-input.ts';
import { loadOwnProfile } from '@/lib/db/profiles.ts';

export async function POST(request: Request, ctx: RouteContext<'/api/profile/[id]/image-link'>) {
  const { id } = await ctx.params;
  const header = request.headers.get('x-anonymous-token');
  const token = isUuid(header) ? header.toLowerCase() : null;

  const profile = isUuid(id) && token ? await loadOwnProfile(id, token) : null;
  if (!profile || !token) return Response.json({ error: '결과를 찾을 수 없습니다.' }, { status: 404 });

  return Response.json({ url: imageLinkPath(profile.id, token) }, { headers: { 'Cache-Control': 'no-store' } });
}
