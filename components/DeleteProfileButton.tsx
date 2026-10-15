'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { forgetProfile, readToken } from '@/lib/quiz/storage.ts';

// 결과 화면 맨 아래의 삭제 버튼. 누르면 같은 자리에서 한 번 더 확인받고 지운다.
// 브라우저 확인 창(confirm)은 앱 내장 브라우저에서 막히거나 모양이 제각각이라 쓰지 않는다.
export function DeleteProfileButton({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/profile/${profileId}`, {
        method: 'DELETE',
        headers: { 'x-anonymous-token': readToken() ?? '' },
      });
      // 404는 이미 지워졌거나 내 것이 아닌 경우다. 어느 쪽이든 이 브라우저의 기록은 비운다.
      if (!res.ok && res.status !== 404) throw new Error();
      forgetProfile();
      router.replace('/');
    } catch {
      setNotice('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
      setBusy(false);
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="min-h-12 self-center px-4 text-sm font-medium text-zinc-500 underline underline-offset-4 active:text-zinc-700"
      >
        내 결과 삭제
      </button>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-red-200 bg-red-50 p-4">
      <p className="text-base font-semibold text-zinc-900 break-keep">정말 삭제할까요?</p>
      <p className="text-sm text-zinc-600 break-keep">
        내 응답과 결과, 친구들과의 SYNC 결과가 모두 사라져요. 친구 화면에서도 사라지고, 되돌릴 수 없어요.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="flex min-h-12 flex-1 items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white text-base font-semibold text-zinc-800 active:bg-zinc-100"
        >
          취소
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-red-600 text-base font-semibold text-white active:bg-red-700 disabled:bg-red-300"
        >
          {busy ? '삭제하는 중…' : '삭제하기'}
        </button>
      </div>
      {notice && <p role="status" className="text-center text-sm font-medium text-red-600">{notice}</p>}
    </section>
  );
}
