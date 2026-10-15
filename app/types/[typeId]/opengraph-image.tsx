// 타입 소개 페이지의 공유 이미지. 12장 모두 빌드할 때 한 번만 만들어진다.
import { notFound } from 'next/navigation';
import { COLOR, Card, OG_CONTENT_TYPE, OG_SIZE, renderImage } from '@/lib/og/card.tsx';
import { TYPE_CONTENT } from '@/lib/scoring/v1/content.ts';
import { TYPE_IDS, type TypeId } from '@/lib/scoring/v1/prototypes.ts';

export const alt = 'SYNC 취향 타입';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = false;

export function generateStaticParams() {
  return TYPE_IDS.map(typeId => ({ typeId }));
}

export default async function Image({ params }: { params: Promise<{ typeId: string }> }) {
  const { typeId } = await params;
  if (!(TYPE_IDS as readonly string[]).includes(typeId)) notFound();
  const type = TYPE_CONTENT[typeId as TypeId];

  return renderImage(
    <Card>
      <div style={{ display: 'flex', marginTop: 36, fontSize: 40, fontWeight: 600, color: COLOR.violetLight }}>
        12가지 취향 타입
      </div>
      <div style={{ display: 'flex', marginTop: 8, fontSize: 104, lineHeight: 1.2 }}>{type.name}</div>
      <div style={{ display: 'flex', marginTop: 20, fontSize: 40, fontWeight: 600, color: COLOR.violetLight }}>
        {type.tagline}
      </div>
    </Card>,
  );
}
