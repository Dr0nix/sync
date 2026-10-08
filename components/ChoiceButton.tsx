export function ChoiceButton({
  label, selected, compact, onSelect,
}: {
  label: string;
  selected: boolean;
  compact?: boolean;   // 선택지가 4개일 때. 한 화면에 다 들어오도록 조금 낮춘다.
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`${compact ? 'min-h-20' : 'min-h-24'} w-full rounded-2xl border-2 px-5 py-4 text-left text-xl font-semibold leading-snug break-keep transition-colors active:scale-[0.98] ${
        selected
          ? 'border-violet-600 bg-violet-50 text-violet-900'
          : 'border-zinc-200 bg-white text-zinc-900 active:border-violet-400'
      }`}
    >
      {label}
    </button>
  );
}
