// POST /api/invite — 내 프로필의 초대 코드를 돌려준다. x-anonymous-token 헤더로 본인을 확인한다.
import { isUuid } from '@/lib/api/submit-input.ts';
import { getOrCreateInviteCode } from '@/lib/db/invites.ts';
import { findProfileIdByToken } from '@/lib/db/profiles.ts';

export async function POST(request: Request) {
  const token = request.headers.get('x-anonymous-token');
  const profileId = isUuid(token) ? await findProfileIdByToken(token.toLowerCase()) : null;
  if (!profileId) {
    return Response.json({ error: '테스트를 먼저 완료해 주세요.' }, { status: 403 });
  }
  return Response.json({ inviteCode: await getOrCreateInviteCode(profileId) });
}
