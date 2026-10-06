import type { TestQuestion } from '@/lib/quiz/types.ts';
import { ChoiceButton } from './ChoiceButton.tsx';

// 한 화면 = 한 문항. 문항은 위쪽에, 선택지는 엄지가 닿는 아래쪽에 둔다.
export function QuestionCard({
  question, selected, onSelect,
}: {
  question: TestQuestion;
  selected: string | undefined;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="animate-rise flex flex-1 flex-col">
      <h1 className="flex flex-1 items-center py-8 text-3xl font-bold leading-tight tracking-tight break-keep">
        {question.text}
      </h1>
      <div className="flex flex-col gap-3">
        {question.options.map(option => (
          <ChoiceButton
            key={option.key}
            label={option.label}
            selected={selected === option.key}
            onSelect={() => onSelect(option.key)}
          />
        ))}
      </div>
    </div>
  );
}
