// SYNC 결과 공유 이미지: `지승 × 민수 / SYNC 52% / 등급명`
// 제3자에게 공개되는 범위(닉네임·점수·등급)만 그린다. 타입과 선택 내용은 넣지 않는다(스펙 §12).
import { notFound } from 'next/navigation';
import { isUuid } from '@/lib/api/submit-input.ts';
import { MATCH_PREVIEW } from '@/lib/content/ui-copy.ts';
import { loadMatchSummary } from '@/lib/db/matches.ts';
import { COLOR, Card, OG_CONTENT_TYPE, OG_SIZE, fit, renderImage } from '@/lib/og/card.tsx';
import { gradeFor } from '@/lib/scoring/v1/sync-grade.ts';

export const alt = MATCH_PREVIEW.fallbackAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// 처음 요청될 때 한 번 그려서 캐시에 두고, 그 뒤 요청은 다시 그리지 않는다(스펙 §14 Sprint 2).
// 하루가 지나면 다음 요청 때 한 번 다시 그린다. 그 사이 바뀐 닉네임이 이때 반영된다.
export const dynamic = 'force-static';
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const match = isUuid(matchId) ? await loadMatchSummary(matchId) : null;

  // 없는 매치에는 이미지를 그리지 않는다. 아무 주소나 찔러서 CPU를 쓰게 할 수 없게 한다.
  if (!match) notFound();

  const grade = gradeFor(match.score);
  return renderImage(
    <Card>
      <div style={{ display: 'flex', marginTop: 20, fontSize: 44, fontWeight: 600 }}>
        {fit(match.a, 12)} × {fit(match.b, 12)}
      </div>
      <div style={{ display: 'flex', marginTop: 4, fontSize: 200, lineHeight: 1.1 }}>{match.score}%</div>
      <div style={{ display: 'flex', fontSize: 68 }}>{grade.name}</div>
      <div style={{ display: 'flex', marginTop: 12, fontSize: 32, fontWeight: 600, color: COLOR.violetLight }}>
        {grade.copy}
      </div>
    </Card>,
  );
}
