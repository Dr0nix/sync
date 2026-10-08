'use client';

import { useState } from 'react';
import type { ProfileResult } from '@/lib/api/profile-result.ts';
import { SyncSummaryCard } from './SyncSummaryCard.tsx';

const COLLAPSED_COUNT = 3;

// 비교한 친구 목록. 최신 3명만 보이고, 더보기로 전부 펼쳤다가 다시 접을 수 있다.
export function SyncList({ me, matches }: { me: string; matches: ProfileResult['matches'] }) {
  const [expanded, setExpanded] = useState(false);
  if (matches.length === 0) return null;

  const shown = expanded ? matches : matches.slice(0, COLLAPSED_COUNT);
  const hidden = matches.length - COLLAPSED_COUNT;

  return (
    <section id="sync" className="flex scroll-mt-5 flex-col gap-3">
      <h2 className="text-xl font-bold tracking-tight">
        친구와의 SYNC <span className="font-semibold text-zinc-500">({matches.length})</span>
      </h2>
      <div className="flex flex-col gap-2">
        {shown.map(match => (
          <SyncSummaryCard
            key={match.matchId}
            matchId={match.matchId}
            me={me}
            friend={match.nickname}
            score={match.score}
            gradeName={match.gradeName}
          />
        ))}
      </div>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="min-h-12 w-full rounded-2xl text-base font-semibold text-violet-700 active:bg-violet-50"
        >
          {expanded ? '접기' : `더보기 (${hidden}명 더)`}
        </button>
      )}
    </section>
  );
}
