'use client';

import { useState } from 'react';
import { saveImage } from '@/lib/quiz/share.ts';
import { readToken } from '@/lib/quiz/storage.ts';

// 내 결과 이미지를 받아 저장한다. 이미지는 서버가 그리고, 본인 토큰이 있어야 받을 수 있다.
export function SaveImageButton({ profileId }: { profileId: string }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/profile/${profileId}/image`, {
        headers: { 'x-anonymous-token': readToken() ?? '' },
      });
      if (!res.ok) throw new Error();
      const outcome = await saveImage(await res.blob(), 'sync-result.png');
      if (outcome === 'saved') setNotice('이미지를 저장했어요.');
    } catch {
      setNotice('이미지를 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-zinc-200 px-5 text-lg font-semibold text-zinc-800 active:bg-zinc-100 disabled:text-zinc-400"
      >
        {busy ? '이미지 만드는 중…' : '결과 이미지 저장'}
      </button>
      {notice && <p role="status" className="text-center text-sm font-medium text-zinc-600">{notice}</p>}
    </div>
  );
}
