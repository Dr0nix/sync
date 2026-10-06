// 진행률은 %가 아니라 "18 / 60"으로 보여준다(스펙 §9).
export function ProgressBar({ current, total }: { current: number; total: number }) {
  const ratio = total === 0 ? 0 : Math.min(current / total, 1);
  return (
    <div className="flex flex-1 items-center gap-3">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div
          className="h-full rounded-full bg-violet-600 transition-[width] duration-300"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-500">
        {current} / {total}
      </span>
    </div>
  );
}
