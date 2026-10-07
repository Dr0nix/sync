import Link from 'next/link';

// 결과 페이지 아래에 쌓이는 친구 한 명과의 SYNC 요약. 누르면 상세 페이지로 간다.
export function SyncSummaryCard({
  matchId, me, friend, score, gradeName,
}: {
  matchId: string;
  me: string;
  friend: string;
  score: number;
  gradeName: string;
}) {
  return (
    <Link
      href={`/match/${matchId}`}
      className="flex items-center gap-4 rounded-2xl border-2 border-zinc-200 px-4 py-4 active:bg-zinc-50"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-base font-semibold">{me} × {friend}</p>
        <p className="text-sm text-zinc-600 break-keep">{gradeName}</p>
      </div>
      <p className="shrink-0 text-right">
        <span className="block text-xs font-semibold tracking-wider text-violet-600">SYNC</span>
        <span className="text-3xl font-extrabold tabular-nums">{score}%</span>
      </p>
      <span aria-hidden="true" className="shrink-0 text-2xl text-zinc-400">›</span>
    </Link>
  );
}
