// POST /api/match — 초대 코드의 주인과 나의 SYNC를 계산해 저장한다 (스펙 §6.3)
// 두 사람의 responses는 서버에서만 읽고, 응답에는 §12가 허용한 범위만 담는다.
import { buildMatchResult } from '@/lib/api/match-view.ts';
import { isUuid } from '@/lib/api/submit-input.ts';
import { findInviterId } from '@/lib/db/invites.ts';
import { createOrGetMatch, loadMatch } from '@/lib/db/matches.ts';
import { findProfileIdByToken } from '@/lib/db/profiles.ts';

const error = (status: number, message: string) => Response.json({ error: message }, { status });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, '요청 본문이 올바르지 않습니다.');
  }
  const inviteCode = (body as { inviteCode?: unknown } | null)?.inviteCode;
  if (typeof inviteCode !== 'string') return error(400, 'inviteCode가 올바르지 않습니다.');

  const token = request.headers.get('x-anonymous-token');
  const myId = isUuid(token) ? await findProfileIdByToken(token.toLowerCase()) : null;
  if (!myId) return error(403, '테스트를 먼저 완료해 주세요.');

  const inviterId = await findInviterId(inviteCode);
  if (!inviterId) return error(404, '초대 링크를 찾을 수 없습니다.');
  if (inviterId === myId) return error(400, '내 초대 링크로는 비교할 수 없습니다.');

  const matchId = await createOrGetMatch(inviterId, myId);
  if (matchId === 'no_responses') return error(404, '초대 링크를 찾을 수 없습니다.');

  const loaded = await loadMatch(matchId, token!.toLowerCase());
  if (!loaded) return error(404, '비교 결과를 찾을 수 없습니다.');
  return Response.json(buildMatchResult(loaded.match, loaded.texts, loaded.viewer));
}
