import type { Metadata } from 'next';
import { ResultView } from '@/components/ResultView.tsx';

export const metadata: Metadata = { title: '내 취향 타입 | SYNC' };

export default async function ResultPage(props: PageProps<'/result/[profileId]'>) {
  const { profileId } = await props.params;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-5 pb-8">
      <ResultView profileId={profileId} />
    </main>
  );
}
