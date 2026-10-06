// 영역 하나의 일치율 막대
export function CategorySyncBar({ label, score }: { label: string; score: number }) {
  const value = Math.min(100, Math.max(0, score));
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 shrink-0 text-sm font-semibold">{label}</span>
      <div
        className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-200"
        role="img"
        aria-label={`${label} 일치율 ${value}%`}
      >
        <div className="h-full rounded-full bg-violet-600" style={{ width: `${value}%` }} />
      </div>
      <span className="w-11 shrink-0 text-right text-sm tabular-nums text-zinc-600">{value}%</span>
    </div>
  );
}
