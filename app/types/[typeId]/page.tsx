import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { InsightCard } from '@/components/InsightCard.tsx';
import { TasteDna } from '@/components/TasteDna.tsx';
import { TypeHeroCard } from '@/components/TypeHeroCard.tsx';
import { TYPE_CONTENT } from '@/lib/scoring/v1/content.ts';
import { PROTOTYPES, TYPE_IDS, type TypeId } from '@/lib/scoring/v1/prototypes.ts';
import { TYPE_PAGE_CONTENT } from '@/lib/scoring/v1/type-page-content.ts';
import { relatedTypes } from '@/lib/scoring/v1/type-relations.ts';

// 12개 타입 페이지를 빌드할 때 전부 만든다. 목록에 없는 주소는 404다.
export const dynamicParams = false;

export function generateStaticParams() {
  return TYPE_IDS.map(typeId => ({ typeId }));
}

const isTypeId = (value: string): value is TypeId => (TYPE_IDS as readonly string[]).includes(value);

export async function generateMetadata(props: PageProps<'/types/[typeId]'>): Promise<Metadata> {
  const { typeId } = await props.params;
  if (!isTypeId(typeId)) return {};
  const title = `${TYPE_CONTENT[typeId].name} | SYNC`;
  const description = `${TYPE_CONTENT[typeId].tagline} ${TYPE_PAGE_CONTENT[typeId].intro}`;
  return { title, description, openGraph: { title, description, url: `/types/${typeId}` } };
}

// 정적 페이지. 타입 데이터는 서버에서 읽어 HTML로만 내려가고, 채점 코드는 브라우저로 가지 않는다.
export default async function TypePage(props: PageProps<'/types/[typeId]'>) {
  const { typeId } = await props.params;
  if (!isTypeId(typeId)) notFound();

  const type = TYPE_CONTENT[typeId];
  const page = TYPE_PAGE_CONTENT[typeId];
  const related = relatedTypes(typeId);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-5 pt-5 pb-8">
      <nav className="flex items-center justify-between text-sm font-semibold">
        <Link href="/" className="font-bold tracking-widest text-violet-600">SYNC</Link>
        <Link href="/types" className="text-zinc-500">12가지 타입 전체 보기</Link>
      </nav>

      <TypeHeroCard name={type.name} tagline={type.tagline} />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight">어떤 사람이냐면</h2>
        <p className="text-base leading-relaxed text-zinc-800 break-keep">{page.intro}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight">이럴 때 티가 나요</h2>
        <p className="text-base leading-relaxed text-zinc-800 break-keep">{page.signs}</p>
      </section>

      <InsightCard title="이 타입의 특징" items={type.descriptions} />

      <section className="flex flex-col gap-3">
        <TasteDna axes={PROTOTYPES[typeId].vector} />
        <p className="text-sm text-zinc-500 break-keep">이 타입을 대표하는 취향이에요. 실제 결과는 사람마다 조금씩 달라요.</p>
      </section>

      {related && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">가까운 타입, 먼 타입</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '닮은 타입', id: related.similar },
              { label: '정반대 타입', id: related.opposite },
            ].map(({ label, id }) => (
              <Link key={label} href={`/types/${id}`} className="flex flex-col gap-1 rounded-2xl bg-zinc-100 px-4 py-4 active:bg-zinc-200">
                <span className="text-xs font-semibold text-zinc-500">{label}</span>
                <span className="text-base font-bold break-keep">{TYPE_CONTENT[id].name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Link
        href="/test"
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-violet-600 px-5 text-lg font-semibold text-white active:bg-violet-700"
      >
        내 타입 알아보기
      </Link>
    </main>
  );
}
