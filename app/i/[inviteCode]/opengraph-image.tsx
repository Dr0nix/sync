// 초대 링크 공유 이미지. 초대자의 닉네임만 쓰고 타입·점수는 넣지 않는다(스펙 §12).
import { notFound } from 'next/navigation';
import { INVITE_PREVIEW } from '@/lib/content/ui-copy.ts';
import { findInviter } from '@/lib/db/invites.ts';
import { COLOR, Card, OG_CONTENT_TYPE, OG_SIZE, fit, renderImage } from '@/lib/og/card.tsx';

export const alt = INVITE_PREVIEW.description;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// 처음 요청될 때 한 번 그려서 캐시에 두고, 하루 동안은 다시 그리지 않는다.
export const dynamic = 'force-static';
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ inviteCode: string }> }) {
  const { inviteCode } = await params;
  const inviter = await findInviter(inviteCode);

  // 없는 코드에는 이미지를 그리지 않는다.
  if (!inviter) notFound();

  return renderImage(
    <Card>
      <div style={{ display: 'flex', marginTop: 40, fontSize: 60, color: COLOR.violetLight }}>
        {fit(inviter.nickname, 12)}님이
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, fontSize: 76, lineHeight: 1.25 }}>
        <div style={{ display: 'flex' }}>나랑 취향이 얼마나 겹치는지</div>
        <div style={{ display: 'flex' }}>궁금해해요</div>
      </div>
      <div style={{ display: 'flex', marginTop: 32, fontSize: 32, fontWeight: 600, color: COLOR.violetLight }}>
        둘이 직접 고른 답으로 비교해요
      </div>
    </Card>,
  );
}
