// 양극형 가로 막대. 좌·우 라벨은 항상 보이고, 가운데 50 기준선에서 점수 쪽으로 채운다. 숫자는 보조 정보다(스펙 §9).
export function BipolarTasteBar({ left, right, score }: { left: string; right: string; score: number }) {
  const value = Math.min(100, Math.max(0, score));
  const leans = value === 50 ? null : value > 50 ? 'right' : 'left';
  const from = Math.min(value, 50);
  const width = Math.abs(value - 50);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className={leans === 'left' ? 'font-bold text-zinc-900' : 'text-zinc-500'}>{left}</span>
        <span className={leans === 'right' ? 'font-bold text-zinc-900' : 'text-zinc-500'}>{right}</span>
      </div>
      <div
        className="relative h-3 rounded-full bg-zinc-200"
        role="img"
        aria-label={`${left} 0, ${right} 100 기준 ${value}`}
      >
        <div
          className="absolute inset-y-0 rounded-full bg-violet-600"
          style={{ left: `${from}%`, width: `${width}%` }}
        />
        <div className="absolute inset-y-[-3px] left-1/2 w-0.5 -translate-x-1/2 rounded bg-zinc-400" />
        <div
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-violet-700 shadow"
          style={{ left: `${value}%` }}
        />
      </div>
      <span className="self-center text-xs tabular-nums text-zinc-400">{value}</span>
    </div>
  );
}
