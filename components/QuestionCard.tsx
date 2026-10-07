import { optionOrder } from '@/lib/quiz/option-order.ts';
import type { TestQuestion } from '@/lib/quiz/types.ts';
import { ChoiceButton } from './ChoiceButton.tsx';

// 한 화면 = 한 문항. 문항은 위쪽에, 선택지는 엄지가 닿는 아래쪽에 둔다.
// 선택지는 seed로 정한 순서로 보여주고, 고른 값은 화면 순서와 상관없이 원래 key로 넘긴다.
export function QuestionCard({
  question, seed, selected, onSelect,
}: {
  question: TestQuestion;
  seed: string;
  selected: string | undefined;
  onSelect: (key: string) => void;
}) {
  const options = optionOrder(seed, question.id, question.options.length).map(i => question.options[i]);

  return (
    <div className="animate-rise flex flex-1 flex-col">
      <h1 className="flex flex-1 items-center py-6 text-3xl font-bold leading-tight tracking-tight break-keep">
        {question.text}
      </h1>
      <div className="flex flex-col gap-3">
        {options.map(option => (
          <ChoiceButton
            key={option.key}
            label={option.label}
            selected={selected === option.key}
            compact={options.length > 2}
            onSelect={() => onSelect(option.key)}
          />
        ))}
      </div>
    </div>
  );
}
