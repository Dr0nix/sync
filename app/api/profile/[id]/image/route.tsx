// GET /api/profile/[id]/image — 내 결과 이미지(PNG). x-anonymous-token 헤더가 프로필의 토큰과 같아야 한다.
// 주소만 알아서는 남의 타입 이미지를 받을 수 없다. 본인만 받으므로 공유 캐시에는 두지 않는다.
import { isUuid } from '@/lib/api/submit-input.ts';
import { loadOwnProfile } from '@/lib/db/profiles.ts';
import { renderImage } from '@/lib/og/card.tsx';
import { PROFILE_IMAGE_SIZE, ProfileCard } from '@/lib/og/profile-card.tsx';
import { TYPE_CONTENT } from '@/lib/scoring/v1/content.ts';

export async function GET(request: Request, ctx: RouteContext<'/api/profile/[id]/image'>) {
  const { id } = await ctx.params;
  const token = request.headers.get('x-anonymous-token');

  const profile = isUuid(id) && isUuid(token) ? await loadOwnProfile(id, token.toLowerCase()) : null;
  if (!profile) return Response.json({ error: '결과를 찾을 수 없습니다.' }, { status: 404 });

  const type = TYPE_CONTENT[profile.typeId];
  return renderImage(
    <ProfileCard nickname={profile.nickname} typeName={type.name} tagline={type.tagline} axes={profile.axes} />,
    { ...PROFILE_IMAGE_SIZE, cacheControl: 'private, max-age=300' },
  );
}
