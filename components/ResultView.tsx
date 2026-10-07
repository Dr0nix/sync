'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ProfileResult } from '@/lib/api/profile-result.ts';
import { clearPendingInvite, readPendingInvite, readToken } from '@/lib/quiz/storage.ts';
import { InsightCard } from './InsightCard.tsx';
import { InviteCTA } from './InviteCTA.tsx';
import { SaveImageButton } from './SaveImageButton.tsx';
import { SyncSummaryCard } from './SyncSummaryCard.tsx';
import { TasteDna } from './TasteDna.tsx';
import { TypeHeroCard } from './TypeHeroCard.tsx';

type State =
  | { status: 'loading' }
  | { status: 'ok'; result: ProfileResult }
  | { status: 'not_found' }
  | { status: 'error' };

const primaryLink =
  'flex min-h-14 w-full items-center justify-center rounded-2xl bg-violet-600 px-5 text-lg font-semibold text-white active:bg-violet-700';

// 초대 링크로 들어온 사람이면, 기억해 둔 초대 코드로 초대자와의 매치를 만든다.
// 계산은 서버가 하고 여기서는 요청만 보낸다.
async function settlePendingInvite(token: string) {
  const inviteCode = readPendingInvite();
  if (!inviteCode) return;
  try {
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-anonymous-token': token },
      body: JSON.stringify({ inviteCode }),
    });
    // 만들어졌거나, 내 링크(400)·없는 링크(404)라 다시 시도해도 소용없는 경우에만 지운다.
    if (res.ok || res.status === 400 || res.status === 404) clearPendingInvite();
  } catch {
    // 네트워크 오류면 남겨 뒀다가 다음에 결과 페이지를 열 때 다시 시도한다.
  }
}

// 토큰이 localStorage에 있어서 결과는 브라우저에서 불러온다. 채점은 하지 않고 받은 값을 그리기만 한다.
export function ResultView({ profileId }: { profileId: string }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<State> => {
      const token = readToken();
      if (!token) return { status: 'not_found' };
      try {
        await settlePendingInvite(token);
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

  // 이미 테스트한 사람이 초대 링크를 열면 #sync로 온다. 내용이 그려진 뒤에 그 영역으로 내린다.
  useEffect(() => {
    if (state.status === 'ok' && window.location.hash === '#sync') {
      document.getElementById('sync')?.scrollIntoView();
    }
  }, [state.status]);

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
      <SaveImageButton profileId={result.profileId} />

      {/* 싱크로율은 내 결과 설명이 전부 끝난 뒤에 나온다. */}
      {result.matches.length > 0 && (
        <section id="sync" className="flex scroll-mt-5 flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">친구와의 SYNC</h2>
          <div className="flex flex-col gap-2">
            {result.matches.map(match => (
              <SyncSummaryCard
                key={match.matchId}
                matchId={match.matchId}
                me={result.nickname}
                friend={match.nickname}
                score={match.score}
                gradeName={match.gradeName}
              />
            ))}
          </div>
        </section>
      )}

      <InviteCTA typeName={result.type.name} />
      <Link
        href="/test"
        className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-zinc-200 px-5 text-lg font-semibold text-zinc-800 active:bg-zinc-100"
      >
        다시 하기
      </Link>
    </div>
  );
}
