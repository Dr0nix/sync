export function ChoiceButton({
  label, selected, onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`min-h-16 w-full rounded-2xl border-2 px-5 py-4 text-left text-lg font-medium leading-snug transition-colors active:scale-[0.98] ${
        selected
          ? 'border-violet-600 bg-violet-50 text-violet-900'
          : 'border-zinc-200 bg-white text-zinc-900 active:border-violet-400'
      }`}
    >
      {label}
    </button>
  );
}
