'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { readProfileId, readToken, savePendingInvite } from '@/lib/quiz/storage.ts';

// 초대 화면에서 초대 코드를 기억해 둔다. 화면에는 아무것도 그리지 않는다.
// 이미 테스트를 마친 브라우저면 재응답 없이 자기 결과 페이지의 SYNC 영역으로 보낸다. 매치는 거기서 만들어진다.
export function InviteCapture({ inviteCode }: { inviteCode: string }) {
  const router = useRouter();

  useEffect(() => {
    savePendingInvite(inviteCode);
    const profileId = readProfileId();
    if (profileId && readToken()) router.replace(`/result/${profileId}#sync`);
  }, [inviteCode, router]);

  return null;
}
