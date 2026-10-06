// GET /api/match/[id] — 비교 결과 조회 (스펙 §6.3)
// x-anonymous-token이 두 당사자 중 한 명의 것이면 상세까지, 아니면 닉네임·점수·등급만 내려준다.
import { buildMatchResult } from '@/lib/api/match-view.ts';
import { isUuid } from '@/lib/api/submit-input.ts';
import { loadMatch } from '@/lib/db/matches.ts';

export async function GET(request: Request, ctx: RouteContext<'/api/match/[id]'>) {
  const { id } = await ctx.params;
  const token = request.headers.get('x-anonymous-token');

  const loaded = isUuid(id) ? await loadMatch(id, isUuid(token) ? token.toLowerCase() : null) : null;
  if (!loaded) return Response.json({ error: '비교 결과를 찾을 수 없습니다.' }, { status: 404 });

  return Response.json(
    buildMatchResult(loaded.match, loaded.texts, loaded.viewer),
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
