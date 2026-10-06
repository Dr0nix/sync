'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { MatchResult } from '@/lib/api/match-result.ts';
import { SHARE_COPY } from '@/lib/content/ui-copy.ts';
import { shareLink } from '@/lib/quiz/share.ts';
import { readProfileId, readToken } from '@/lib/quiz/storage.ts';
import { CategorySyncBar } from './CategorySyncBar.tsx';
import { InsightCard } from './InsightCard.tsx';
import { MatchItemCard } from './MatchItemCard.tsx';
import { SyncScoreHero } from './SyncScoreHero.tsx';

type State =
  | { status: 'loading' }
  | { status: 'ok'; match: MatchResult; myProfileId: string | null }
  | { status: 'not_found' }
  | { status: 'error' };

const primary =
  'flex min-h-14 w-full items-center justify-center rounded-2xl bg-violet-600 px-5 text-lg font-semibold text-white active:bg-violet-700';
const secondary =
  'flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-zinc-200 px-5 text-lg font-semibold text-zinc-800 active:bg-zinc-100';

// 서버가 추려서 내려준 비교 결과를 그리기만 한다. 당사자가 아니면 detail이 없어 요약만 보인다.
export function MatchView({ matchId }: { matchId: string }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<State> => {
      const token = readToken();
      try {
        const res = await fetch(`/api/match/${matchId}`, { headers: token ? { 'x-anonymous-token': token } : {} });
        if (res.status === 404) return { status: 'not_found' };
        if (!res.ok) return { status: 'error' };
        return { status: 'ok', match: await res.json(), myProfileId: readProfileId() };
      } catch {
        return { status: 'error' };
      }
    };
    load().then(next => { if (!cancelled) setState(next); });
    return () => { cancelled = true; };
  }, [matchId]);

  if (state.status === 'loading') return <div className="flex-1" aria-busy="true" />;

  if (state.status !== 'ok') {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight break-keep">
            {state.status === 'not_found' ? '비교 결과를 찾을 수 없어요' : '결과를 불러오지 못했어요'}
          </h1>
          <p className="text-lg text-zinc-600 break-keep">
            {state.status === 'not_found' ? '링크가 잘못됐을 수 있어요.' : '잠시 후 다시 시도해 주세요.'}
          </p>
        </div>
        <Link href="/test" className={primary}>내 취향 알아보기</Link>
      </div>
    );
  }

  const { match, myProfileId } = state;
  const { detail } = match;
  const me = match.me.nickname, friend = match.friend.nickname;

  const share = async () => {
    const outcome = await shareLink({
      url: window.location.href,
      text: SHARE_COPY.match(me, friend, match.score, match.grade.name),
    });
    setNotice(outcome === 'copied' ? '링크를 복사했어요.' : outcome === 'failed' ? '복사하지 못했어요. 다시 시도해 주세요.' : null);
  };

  return (
    <div className="animate-rise flex flex-col gap-8">
      <SyncScoreHero
        me={me}
        friend={friend}
        score={match.score}
        gradeName={match.grade.name}
        gradeCopy={match.grade.copy}
        meType={detail?.me.type?.name}
        friendType={detail?.friend.type?.name}
      />

      {detail && detail.categories.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">영역별 SYNC</h2>
          <div className="flex flex-col gap-3">
            {detail.categories.map(c => <CategorySyncBar key={c.id} label={c.label} score={c.score} />)}
          </div>
        </section>
      )}

      {detail && detail.matched.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">🔥 소름 돋게 같은 것</h2>
          <ul className="flex flex-col gap-2">
            {detail.matched.map(item => <MatchItemCard key={item.question} question={item.question} answer={item.answer} />)}
          </ul>
        </section>
      )}

      {detail && detail.mismatched.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">💥 이상하게 갈리는 것</h2>
          <ul className="flex flex-col gap-2">
            {detail.mismatched.map(item => (
              <MatchItemCard
                key={item.question}
                question={item.question}
                me={{ name: me, answer: item.me }}
                friend={{ name: friend, answer: item.friend }}
              />
            ))}
          </ul>
        </section>
      )}

      {detail && <InsightCard title="🎯 둘이 잘 맞는 상황" items={detail.goodAt} />}
      {detail && <InsightCard title="⚠️ 의견 갈릴 상황" items={detail.clashAt} />}

      <div className="flex flex-col gap-2">
        <button type="button" onClick={share} className={primary}>결과 공유하기</button>
        {notice && <p role="status" className="text-center text-sm font-medium text-violet-700">{notice}</p>}
        {myProfileId
          ? <Link href={`/result/${myProfileId}`} className={secondary}>내 결과 보기</Link>
          : <Link href="/test" className={secondary}>나도 해보기</Link>}
      </div>
    </div>
  );
}
