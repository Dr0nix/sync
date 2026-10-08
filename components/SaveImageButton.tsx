'use client';

import { useState } from 'react';
import { canShareFile, shareFile } from '@/lib/quiz/share.ts';
import { readToken } from '@/lib/quiz/storage.ts';

const FILENAME = 'sync-result.png';

const secondary =
  'flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-zinc-200 px-5 text-lg font-semibold text-zinc-800 active:bg-zinc-100 disabled:text-zinc-400';

// 내 결과 이미지를 화면에 보여주고, 거기서 저장하거나 공유하게 한다.
// 이미지는 서버가 그린다. 서버에서 잠깐만 유효한 주소를 받아 img와 내려받기 링크에 그대로 쓴다.
// 브라우저 메모리의 임시 주소(blob:)를 쓰지 않는 이유: 카카오톡 같은 앱 내장 브라우저가 그런 파일을 내려받지 못한다.
export function SaveImageButton({ profileId }: { profileId: string }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/profile/${profileId}/image-link`, {
        method: 'POST',
        headers: { 'x-anonymous-token': readToken() ?? '' },
      });
      if (!res.ok) throw new Error();
      const link: string = (await res.json()).url;
      setUrl(link);
      // 공유 버튼용 파일은 미리 받아 둔다. 버튼을 누른 그 순간에 공유 창을 띄워야 브라우저가 막지 않는다.
      // 실패해도 길게 눌러 저장과 내려받기는 그대로 쓸 수 있다.
      fetch(link)
        .then(r => (r.ok ? r.blob() : Promise.reject()))
        .then(blob => {
          const f = new File([blob], FILENAME, { type: 'image/png' });
          if (canShareFile(f)) setFile(f);
        })
        .catch(() => {});
    } catch {
      setNotice('이미지를 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  if (!url) {
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
        src={url}
        alt="내 취향 타입 결과 이미지"
        width={1080}
        height={1920}
        className="mx-auto h-auto w-2/3 rounded-2xl border border-zinc-200"
      />
      <p className="text-center text-sm text-zinc-500 break-keep">
        이미지를 길게 누르면 사진첩에 저장할 수 있어요.
      </p>
      <a href={`${url}&download=1`} download={FILENAME} className={secondary}>이미지 내려받기</a>
      {file && (
        <button
          type="button"
          className={secondary}
          onClick={async () => {
            setNotice(null);
            const outcome = await shareFile(file);
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
