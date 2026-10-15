import type { Metadata } from 'next';
import Link from 'next/link';
import { TYPE_CONTENT } from '@/lib/scoring/v1/content.ts';
import { TYPE_IDS } from '@/lib/scoring/v1/prototypes.ts';

const title = '12가지 취향 타입 | SYNC';
const description = '계획형 쾌락주의자부터 밸런스 플레이어까지, SYNC의 12가지 취향 타입을 소개합니다.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, url: '/types' },
};

// 정적 페이지. 타입 데이터는 서버에서 읽어 HTML로만 내려간다.
export default function TypesPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-5 pt-10 pb-8">
      <header className="flex flex-col gap-3">
        <Link href="/" className="text-sm font-bold tracking-widest text-violet-600">SYNC</Link>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight break-keep">12가지 취향 타입</h1>
        <p className="text-lg text-zinc-600 break-keep">
          60개의 취향 질문에 답하면 이 중 하나로 판정돼요.
        </p>
      </header>

      <ul className="flex flex-col gap-2">
        {TYPE_IDS.map(id => (
          <li key={id}>
            <Link
              href={`/types/${id}`}
              className="flex items-center gap-4 rounded-2xl border-2 border-zinc-200 px-4 py-4 active:bg-zinc-50"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-lg font-bold break-keep">{TYPE_CONTENT[id].name}</p>
                <p className="text-sm text-zinc-600 break-keep">{TYPE_CONTENT[id].tagline}</p>
              </div>
              <span aria-hidden="true" className="shrink-0 text-2xl text-zinc-400">›</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/test"
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-violet-600 px-5 text-lg font-semibold text-white active:bg-violet-700"
      >
        내 타입 알아보기
      </Link>
    </main>
  );
}
