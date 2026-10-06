import type { Metadata } from 'next';
import { MatchView } from '@/components/MatchView.tsx';

export const metadata: Metadata = { title: '우리의 SYNC | SYNC' };

export default async function MatchPage(props: PageProps<'/match/[matchId]'>) {
  const { matchId } = await props.params;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-5 pb-8">
      <MatchView matchId={matchId} />
    </main>
  );
}
