// `지승 × 민수 / SYNC 91% / 등급명`. 이 카드만 캡처해도 서비스가 보여야 한다(스펙 §19).
export function SyncScoreHero({
  me, friend, score, gradeName, gradeCopy, meType, friendType,
}: {
  me: string;
  friend: string;
  score: number;
  gradeName: string;
  gradeCopy: string;
  meType?: string | null;
  friendType?: string | null;
}) {
  return (
    <section className="rounded-3xl bg-violet-600 px-6 py-8 text-center text-white">
      <p className="text-lg font-semibold break-keep">{me} × {friend}</p>
      <p className="mt-4 text-sm font-bold tracking-widest text-violet-200">SYNC</p>
      <p className="text-7xl font-extrabold leading-none tracking-tight tabular-nums">{score}%</p>
      <h1 className="mt-5 text-3xl font-extrabold tracking-tight break-keep">{gradeName}</h1>
      <p className="mt-2 text-base text-violet-50 break-keep">{gradeCopy}</p>
      {meType && friendType && (
        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/25 pt-5 text-left">
          {[[me, meType], [friend, friendType]].map(([name, type], i) => (
            <div key={i} className="min-w-0">
              <dt className="truncate text-xs text-violet-200">{name}</dt>
              <dd className="text-sm font-semibold break-keep">{type}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
