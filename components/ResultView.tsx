'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ProfileResult } from '@/lib/api/profile-result.ts';
import { readToken } from '@/lib/quiz/storage.ts';
import { InsightCard } from './InsightCard.tsx';
import { TasteDna } from './TasteDna.tsx';
import { TypeHeroCard } from './TypeHeroCard.tsx';

type State =
  | { status: 'loading' }
  | { status: 'ok'; result: ProfileResult }
  | { status: 'not_found' }
  | { status: 'error' };

const primaryLink =
  'flex min-h-14 w-full items-center justify-center rounded-2xl bg-violet-600 px-5 text-lg font-semibold text-white active:bg-violet-700';

// 토큰이 localStorage에 있어서 결과는 브라우저에서 불러온다. 채점은 하지 않고 받은 값을 그리기만 한다.
export function ResultView({ profileId }: { profileId: string }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<State> => {
      const token = readToken();
      if (!token) return { status: 'not_found' };
      try {
        const res = await fetch(`/api/profile/${profileId}`, { headers: { 'x-anonymous-token': token } });
        if (res.status === 404) return { status: 'not_found' };
        if (!res.ok) return { status: 'error' };
        return { status: 'ok', result: await res.json() };
      } catch {
        return { status: 'error' };
      }
    };
    load().then(next => { if (!cancelled) setState(next); });
    return () => { cancelled = true; };
  }, [profileId]);

  if (state.status === 'loading') return <div className="flex-1" aria-busy="true" />;

  if (state.status !== 'ok') {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight break-keep">
            {state.status === 'not_found' ? '이 결과는 본인만 볼 수 있어요' : '결과를 불러오지 못했어요'}
          </h1>
          <p className="text-lg text-zinc-600 break-keep">
            {state.status === 'not_found'
              ? '테스트를 한 브라우저에서 열거나, 직접 내 타입을 알아보세요.'
              : '잠시 후 다시 시도해 주세요.'}
          </p>
        </div>
        <Link href="/test" className={primaryLink}>내 취향 알아보기</Link>
      </div>
    );
  }

  const { result } = state;
  return (
    <div className="animate-rise flex flex-col gap-8">
      <TypeHeroCard
        nickname={result.nickname}
        name={result.type.name}
        tagline={result.type.tagline}
        subtypeName={result.subtype?.name}
      />
      <TasteDna axes={result.axes} />
      <InsightCard title="나를 설명하는 3가지" items={result.insights} />
      <InsightCard title="내 안의 이상한 조합" items={result.paradoxes} />
      <Link
        href="/test"
        className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-zinc-200 px-5 text-lg font-semibold text-zinc-800 active:bg-zinc-100"
      >
        다시 하기
      </Link>
    </div>
  );
}
