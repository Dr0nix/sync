// 결과는 "당신은 A입니다"로 단정한다. 퍼센트를 붙이지 않는다(스펙 §9).
export function TypeHeroCard({
  nickname, name, tagline, subtypeName,
}: {
  nickname: string;
  name: string;
  tagline: string;
  subtypeName?: string | null;
}) {
  return (
    <section className="rounded-3xl bg-violet-600 px-6 py-8 text-white">
      <p className="text-base font-medium text-violet-100">{nickname}님은</p>
      <h1 className="mt-1 text-4xl font-extrabold leading-tight tracking-tight break-keep">{name}</h1>
      <p className="mt-3 text-lg font-medium text-violet-50 break-keep">{tagline}</p>
      {subtypeName && (
        <p className="mt-5 border-t border-white/25 pt-4 text-sm text-violet-100 break-keep">
          당신 안에는 {subtypeName}도 조금 있습니다.
        </p>
      )}
    </section>
  );
}
