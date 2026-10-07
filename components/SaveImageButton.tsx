'use client';

import { useEffect, useState } from 'react';
import { canShareFile, shareFile } from '@/lib/quiz/share.ts';
import { readToken } from '@/lib/quiz/storage.ts';

const FILENAME = 'sync-result.png';

type Ready = { url: string; file: File; shareable: boolean };

const secondary =
  'flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-zinc-200 px-5 text-lg font-semibold text-zinc-800 active:bg-zinc-100 disabled:text-zinc-400';

// 내 결과 이미지를 받아서 보여주고, 거기서 저장하거나 공유하게 한다.
// 이미지는 서버가 그리고 본인 토큰이 있어야 받을 수 있다.
// 받자마자 바로 공유 창을 띄우지 않는 이유: 버튼을 누른 뒤 이미지를 받는 동안 시간이 지나면
// 브라우저가 공유를 막는다. 그래서 먼저 이미지를 띄워 두고, 저장·공유는 그 뒤의 버튼으로 한다.
export function SaveImageButton({ profileId }: { profileId: string }) {
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<Ready | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // 화면을 떠날 때 이미지 주소를 해제한다.
  useEffect(() => () => { if (ready) URL.revokeObjectURL(ready.url); }, [ready]);

  const load = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/profile/${profileId}/image`, {
        headers: { 'x-anonymous-token': readToken() ?? '' },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const file = new File([blob], FILENAME, { type: 'image/png' });
      setReady({ url: URL.createObjectURL(blob), file, shareable: canShareFile(file) });
    } catch {
      setNotice('이미지를 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex flex-col gap-2">
        <button type="button" onClick={load} disabled={busy} className={secondary}>
          {busy ? '이미지 만드는 중…' : '결과 이미지 만들기'}
        </button>
        {notice && <p role="status" className="text-center text-sm font-medium text-red-600">{notice}</p>}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-zinc-200 p-4">
      <h2 className="text-xl font-bold tracking-tight">결과 이미지</h2>
      {/* 서버가 그려 준 이미지를 그대로 보여준다. 길게 눌러 저장할 수 있어야 해서 일반 img를 쓴다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ready.url}
        alt="내 취향 타입 결과 이미지"
        className="mx-auto w-2/3 rounded-2xl border border-zinc-200"
      />
      <p className="text-center text-sm text-zinc-500 break-keep">
        이미지를 길게 누르면 사진첩에 저장할 수 있어요.
      </p>
      <a href={ready.url} download={FILENAME} className={secondary}>이미지 내려받기</a>
      {ready.shareable && (
        <button
          type="button"
          className={secondary}
          onClick={async () => {
            setNotice(null);
            const outcome = await shareFile(ready.file);
            if (outcome === 'failed') setNotice('이 기기에서는 바로 공유할 수 없어요. 이미지를 저장한 뒤 올려 주세요.');
          }}
        >
          이미지 공유하기
        </button>
      )}
      {notice && <p role="status" className="text-center text-sm font-medium text-zinc-600 break-keep">{notice}</p>}
    </section>
  );
}
