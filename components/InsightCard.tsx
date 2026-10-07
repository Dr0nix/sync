export function InsightCard({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <ul className="flex flex-col gap-2">
        {items.map(item => (
          <li key={item} className="rounded-2xl bg-zinc-100 px-4 py-3.5 text-base leading-relaxed break-keep">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
