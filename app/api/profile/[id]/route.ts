// GET /api/profile/[id] — 본인 결과 조회. x-anonymous-token 헤더가 프로필의 토큰과 같아야 한다 (스펙 §6.3)
import type { ProfileResult } from '@/lib/api/profile-result.ts';
import { isUuid } from '@/lib/api/submit-input.ts';
import { loadOwnProfile } from '@/lib/db/profiles.ts';
import { TYPE_CONTENT } from '@/lib/scoring/v1/content.ts';
import { selectInsights } from '@/lib/scoring/v1/insights.ts';

// 없는 프로필과 남의 프로필에 같은 응답을 준다. 프로필이 있는지 알려주지 않기 위해서다.
const notFound = () => Response.json({ error: '결과를 찾을 수 없습니다.' }, { status: 404 });

export async function GET(request: Request, ctx: RouteContext<'/api/profile/[id]'>) {
  const { id } = await ctx.params;
  const token = request.headers.get('x-anonymous-token');
  if (!isUuid(id) || !isUuid(token)) return notFound();

  const profile = await loadOwnProfile(id, token.toLowerCase());
  if (!profile) return notFound();

  const type = TYPE_CONTENT[profile.typeId];
  const subtype = profile.subtypeId ? TYPE_CONTENT[profile.subtypeId] : null;

  return Response.json(
    {
      profileId: profile.id,
      nickname: profile.nickname,
      type: { id: profile.typeId, name: type.name, tagline: type.tagline },
      subtype: subtype && profile.subtypeId ? { id: profile.subtypeId, name: subtype.name } : null,
      axes: profile.axes,
      // Insight는 저장하지 않고 캐시된 점수로 매번 만든다.
      ...selectInsights(profile.axes, profile.typeId),
    } satisfies ProfileResult,
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
