'use client';

import { useRef, useState } from 'react';
import { SHARE_COPY } from '@/lib/content/ui-copy.ts';
import { copyText, shareLink } from '@/lib/quiz/share.ts';
import { readToken } from '@/lib/quiz/storage.ts';

type Notice = { tone: 'ok' | 'error'; text: string } | null;

// 내 초대 링크를 만들어 공유한다. 링크는 프로필당 하나라 여러 친구에게 같은 걸 보내면 된다.
export function InviteCTA({ typeName }: { typeName: string }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const cachedUrl = useRef<string | null>(null);

  const inviteUrl = async (): Promise<string> => {
    if (cachedUrl.current) return cachedUrl.current;
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'x-anonymous-token': readToken() ?? '' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? '링크를 만들지 못했습니다.');
    cachedUrl.current = `${window.location.origin}/i/${data.inviteCode}`;
    return cachedUrl.current;
  };

  const run = async (action: (url: string) => Promise<Notice>) => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      setNotice(await action(await inviteUrl()));
    } catch (err) {
      setNotice({ tone: 'error', text: err instanceof Error ? err.message : '링크를 만들지 못했습니다.' });
    } finally {
      setBusy(false);
    }
  };

  const copied: Notice = { tone: 'ok', text: '링크를 복사했어요. 친구에게 붙여넣어 보내세요.' };
  const failed: Notice = { tone: 'error', text: '복사하지 못했어요. 다시 시도해 주세요.' };

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-violet-50 px-5 py-6">
      <h2 className="text-xl font-bold tracking-tight break-keep">친구는 나랑 얼마나 맞을까?</h2>
      <p className="text-base text-zinc-600 break-keep">
        링크를 보내고 친구가 테스트를 마치면 둘의 SYNC가 나와요.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => run(async url => {
          const outcome = await shareLink({ url, text: SHARE_COPY.invite(typeName) });
          if (outcome === 'copied') return copied;
          if (outcome === 'failed') return failed;
          return null;
        })}
        className="min-h-14 w-full rounded-2xl bg-violet-600 px-5 text-lg font-semibold text-white active:bg-violet-700 disabled:bg-zinc-300"
      >
        친구에게 보내기
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => run(async url => ((await copyText(url)) ? copied : failed))}
        className="min-h-12 w-full rounded-2xl text-base font-semibold text-violet-700 active:bg-violet-100"
      >
        링크 복사
      </button>
      {notice && (
        <p role="status" className={`text-sm font-medium ${notice.tone === 'ok' ? 'text-violet-700' : 'text-red-600'}`}>
          {notice.text}
        </p>
      )}
    </section>
  );
}
