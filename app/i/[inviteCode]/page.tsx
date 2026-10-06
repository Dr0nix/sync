import { redirect } from 'next/navigation';
import { InviteCapture } from '@/components/InviteCapture.tsx';
import { Landing } from '@/components/Landing.tsx';
import { findInviterId } from '@/lib/db/invites.ts';

// 초대 화면. 메인과 같은 구성이고 초대자의 타입·점수는 보여주지 않는다(스펙 §12).
export default async function InvitePage(props: PageProps<'/i/[inviteCode]'>) {
  const { inviteCode } = await props.params;

  // 없는 코드면 초대 없이 메인으로 보낸다.
  if (!(await findInviterId(inviteCode))) redirect('/');

  return (
    <>
      <Landing />
      <InviteCapture inviteCode={inviteCode} />
    </>
  );
}
