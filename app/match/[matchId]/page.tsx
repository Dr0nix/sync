import type { Metadata } from 'next';
import { MatchView } from '@/components/MatchView.tsx';
import { isUuid } from '@/lib/api/submit-input.ts';
import { MATCH_PREVIEW } from '@/lib/content/ui-copy.ts';
import { loadMatchSummary } from '@/lib/db/matches.ts';
import { gradeFor } from '@/lib/scoring/v1/sync-grade.ts';

// 메신저 미리보기용. 제3자에게 공개되는 범위(닉네임·점수·등급)만 넣는다.
export async function generateMetadata(props: PageProps<'/match/[matchId]'>): Promise<Metadata> {
  const { matchId } = await props.params;
  const match = isUuid(matchId) ? await loadMatchSummary(matchId) : null;
  if (!match) return { title: '우리의 SYNC | SYNC' };

  const grade = gradeFor(match.score);
  const title = MATCH_PREVIEW.title(match.a, match.b, match.score);
  const description = MATCH_PREVIEW.description(grade.name, grade.copy);
  return {
    title,
    description,
    openGraph: { title, description, url: `/match/${matchId}` },
  };
}

export default async function MatchPage(props: PageProps<'/match/[matchId]'>) {
  const { matchId } = await props.params;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-5 pb-8">
      <MatchView matchId={matchId} />
    </main>
  );
}
