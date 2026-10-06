'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { readProfileId, subscribeProfileId } from '@/lib/quiz/storage.ts';

// 이 브라우저에서 이미 테스트를 마쳤으면 결과로 바로 가는 링크를 보여준다.
export function ResumeLink() {
  const profileId = useSyncExternalStore(subscribeProfileId, readProfileId, () => null);
  if (!profileId) return null;
  return (
    <Link
      href={`/result/${profileId}`}
      className="flex min-h-12 w-full items-center justify-center rounded-2xl text-base font-semibold text-violet-700 active:bg-violet-50"
    >
      내 결과 다시 보기
    </Link>
  );
}
