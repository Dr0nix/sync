import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { InviteCapture } from '@/components/InviteCapture.tsx';
import { Landing } from '@/components/Landing.tsx';
import { INVITE_PREVIEW } from '@/lib/content/ui-copy.ts';
import { findInviter } from '@/lib/db/invites.ts';

// 메신저 미리보기에 누가 비교를 요청했는지 나오게 한다. 닉네임만 쓰고 타입·점수는 넣지 않는다.
export async function generateMetadata(props: PageProps<'/i/[inviteCode]'>): Promise<Metadata> {
  const { inviteCode } = await props.params;
  const inviter = await findInviter(inviteCode);
  if (!inviter) return {};

  const title = INVITE_PREVIEW.title(inviter.nickname);
  const { description } = INVITE_PREVIEW;
  return {
    title,
    description,
    openGraph: { title, description, url: `/i/${inviteCode}` },
  };
}

// 초대 화면. 메인과 같은 구성이고 초대자의 타입·점수는 보여주지 않는다(스펙 §12).
export default async function InvitePage(props: PageProps<'/i/[inviteCode]'>) {
  const { inviteCode } = await props.params;

  // 없는 코드면 초대 없이 메인으로 보낸다.
  if (!(await findInviter(inviteCode))) redirect('/');

  return (
    <>
      <Landing />
      <InviteCapture inviteCode={inviteCode} />
    </>
  );
}
