// GET /api/profile/[id]/image — 내 결과 이미지(PNG). 본인만 받을 수 있다. 확인 방법은 둘 중 하나다.
//   1) x-anonymous-token 헤더가 프로필의 토큰과 같다.
//   2) 주소에 임시 서명(exp, sig)이 붙어 있다. POST /api/profile/[id]/image-link가 발급한다.
// 2)는 헤더를 붙일 수 없는 곳(img 태그, 내려받기 링크, 앱 내장 브라우저)을 위한 것이다.
// download=1이면 브라우저가 화면에 띄우지 않고 파일로 받게 한다.
import { verifyImageLink } from '@/lib/api/image-link.ts';
import { isUuid } from '@/lib/api/submit-input.ts';
import { findTokenByProfileId, loadOwnProfile } from '@/lib/db/profiles.ts';
import { renderImage } from '@/lib/og/card.tsx';
import { PROFILE_IMAGE_SIZE, ProfileCard } from '@/lib/og/profile-card.tsx';
import { TYPE_CONTENT } from '@/lib/scoring/v1/content.ts';

const notFound = () => Response.json({ error: '결과를 찾을 수 없습니다.' }, { status: 404 });

// 요청이 본인 것이면 그 프로필의 토큰을 돌려준다.
async function ownerToken(request: Request, id: string): Promise<string | null> {
  const header = request.headers.get('x-anonymous-token');
  if (isUuid(header)) return header.toLowerCase();

  const params = new URL(request.url).searchParams;
  const exp = Number(params.get('exp')), sig = params.get('sig');
  if (!sig) return null;
  const token = await findTokenByProfileId(id);
  return token && verifyImageLink(id, token, exp, sig) ? token : null;
}

export async function GET(request: Request, ctx: RouteContext<'/api/profile/[id]/image'>) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();

  const token = await ownerToken(request, id);
  const profile = token ? await loadOwnProfile(id, token) : null;
  if (!profile) return notFound();

  const type = TYPE_CONTENT[profile.typeId];
  const download = new URL(request.url).searchParams.get('download') === '1';
  return renderImage(
    <ProfileCard nickname={profile.nickname} typeName={type.name} tagline={type.tagline} axes={profile.axes} />,
    {
      ...PROFILE_IMAGE_SIZE,
      cacheControl: 'private, max-age=300',
      headers: download ? { 'Content-Disposition': 'attachment; filename="sync-result.png"' } : undefined,
    },
  );
}
