import type { Metadata } from 'next';
import { connection } from 'next/server';
import { TestFlow } from '@/components/TestFlow.tsx';
import { TEST_VERSION, loadTestQuestions } from '@/lib/db/questions.ts';

export const metadata: Metadata = { title: '취향 테스트 | SYNC' };

export default async function TestPage() {
  // 문항은 빌드 시점이 아니라 요청 시점의 DB에서 읽는다.
  await connection();
  const questions = await loadTestQuestions();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-3 pb-6">
      <TestFlow questions={questions} version={TEST_VERSION} />
    </main>
  );
}
