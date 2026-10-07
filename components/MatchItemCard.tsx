// 공통점 또는 차이점 한 문항. 차이점이면 두 사람의 선택을 나란히 보여준다.
type Props =
  | { question: string; answer: string }
  | { question: string; me: { name: string; answer: string }; friend: { name: string; answer: string } };

export function MatchItemCard(props: Props) {
  return (
    <li className="flex flex-col gap-2 rounded-2xl bg-zinc-100 px-4 py-3.5">
      <p className="text-sm text-zinc-500 break-keep">{props.question}</p>
      {'answer' in props ? (
        <p className="text-base font-semibold break-keep">{props.answer}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {[props.me, props.friend].map((side, i) => (
            <div key={i} className="min-w-0">
              <p className="truncate text-xs text-zinc-500">{side.name}</p>
              <p className="text-base font-semibold break-keep">{side.answer}</p>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}
