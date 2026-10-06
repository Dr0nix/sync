'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useSyncExternalStore } from 'react';
import { AGE_BANDS, GENDERS, NICKNAME_MAX, NICKNAME_MIN } from '@/lib/api/submit-input.ts';
import { AGE_BAND_LABELS, GENDER_LABELS, INTERMISSIONS } from '@/lib/content/ui-copy.ts';
import {
  INTERMISSION_EVERY, answerCurrent, goBack, isComplete, isIntermission,
  type Draft,
} from '@/lib/quiz/draft.ts';
import { createDraftStore, getOrCreateToken, saveProfileId } from '@/lib/quiz/storage.ts';
import type { TestQuestion } from '@/lib/quiz/types.ts';
import { ProgressBar } from './ProgressBar.tsx';
import { QuestionCard } from './QuestionCard.tsx';

// 문항이 바뀐 직후의 탭은 무시한다. 같은 자리를 두 번 누르면 다음 문항까지 답해버리기 때문이다.
const TAP_GUARD_MS = 250;

const primaryButton =
  'min-h-14 w-full rounded-2xl bg-violet-600 px-5 text-lg font-semibold text-white transition-colors active:bg-violet-700 disabled:bg-zinc-300';

export function TestFlow({ questions, version }: { questions: TestQuestion[]; version: number }) {
  const router = useRouter();
  const [store] = useState(() => createDraftStore(questions, version));
  // 서버 렌더와 첫 hydration에서는 null이고, 그 뒤 localStorage에서 되살린 값으로 바뀐다.
  const draft = useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
  const [intermission, setIntermission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);   // 같은 틱 안의 연속 탭까지 막는다
  const lastAnswerAt = useRef(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 제출이 끝나면 버퍼를 비우는데, 결과 화면으로 넘어가기 전에 닉네임 입력이 다시 보이지 않게 한다.
  if (!draft || submitted) return <div className="flex-1" aria-busy="true" />;

  const total = questions.length;

  const submit = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymousToken: getOrCreateToken(),
          nickname: draft.nickname,
          gender: draft.gender,
          ageBand: draft.ageBand,
          answers: Object.entries(draft.answers).map(([questionId, answer]) => ({ questionId, answer })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '제출에 실패했습니다.');
      saveProfileId(data.profileId);
      setSubmitted(true);
      store.clear();
      router.replace(`/result/${data.profileId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '제출에 실패했습니다.');
      setSubmitting(false);
      inFlight.current = false;
    }
  };

  if (!draft.started) {
    return <SetupStep draft={draft} onChange={change => store.update(change)} resumable={Object.keys(draft.answers).length > 0} />;
  }

  if (intermission) {
    const copy = INTERMISSIONS[draft.index / INTERMISSION_EVERY - 1] ?? INTERMISSIONS[INTERMISSIONS.length - 1];
    return (
      <div className="animate-rise flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center gap-3">
          <p className="text-sm font-semibold text-violet-600">{draft.index} / {total}</p>
          <h1 className="text-3xl font-bold tracking-tight break-keep">{copy.title}</h1>
          <p className="text-lg text-zinc-600 break-keep">{copy.body}</p>
        </div>
        <button type="button" className={primaryButton} onClick={() => setIntermission(false)}>
          계속하기
        </button>
      </div>
    );
  }

  const header = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => store.update(goBack)}
        disabled={submitting}
        aria-label="이전"
        className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-2xl text-zinc-500 active:bg-zinc-100"
      >
        ‹
      </button>
      <ProgressBar current={Math.min(draft.index + 1, total)} total={total} />
    </div>
  );

  if (draft.index >= total && isComplete(draft, questions)) {
    return (
      <div className="flex flex-1 flex-col">
        {header}
        <div className="animate-rise flex flex-1 flex-col justify-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight break-keep">{total}문항 끝!</h1>
          <p className="text-lg text-zinc-600 break-keep">
            {draft.nickname}님의 타입을 정리했어요.
          </p>
          {error && <p role="alert" className="text-base font-medium text-red-600">{error}</p>}
        </div>
        <button type="button" className={primaryButton} onClick={submit} disabled={submitting}>
          {submitting ? '결과 만드는 중…' : '결과 보기'}
        </button>
      </div>
    );
  }

  const question = questions[draft.index];
  return (
    <div className="flex flex-1 flex-col">
      {header}
      <QuestionCard
        key={question.id}
        question={question}
        selected={draft.answers[question.id]}
        onSelect={key => {
          const now = Date.now();
          if (now - lastAnswerAt.current < TAP_GUARD_MS) return;
          lastAnswerAt.current = now;
          store.update(current => answerCurrent(current, questions, key));
          setIntermission(isIntermission(store.getSnapshot().index, total));
        }}
      />
    </div>
  );
}

function SetupStep({
  draft, onChange, resumable,
}: {
  draft: Draft;
  onChange: (change: (draft: Draft) => Draft) => void;
  resumable: boolean;
}) {
  const length = [...draft.nickname.trim()].length;
  const valid = length >= NICKNAME_MIN && length <= NICKNAME_MAX;

  return (
    <form
      className="animate-rise flex flex-1 flex-col"
      onSubmit={e => {
        e.preventDefault();
        if (valid) onChange(d => ({ ...d, nickname: d.nickname.trim(), started: true }));
      }}
    >
      <div className="flex flex-1 flex-col gap-8 py-6">
        <div className="flex flex-col gap-3">
          <label htmlFor="nickname" className="text-3xl font-bold tracking-tight break-keep">
            뭐라고 부를까요?
          </label>
          <input
            id="nickname"
            value={draft.nickname}
            onChange={e => { const nickname = e.target.value; onChange(d => ({ ...d, nickname })); }}
            placeholder={`닉네임 ${NICKNAME_MIN}~${NICKNAME_MAX}자`}
            maxLength={NICKNAME_MAX * 2}
            autoComplete="off"
            enterKeyHint="done"
            className="h-14 w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 text-lg outline-none focus:border-violet-600"
          />
          <p className="text-sm text-zinc-500">실명이 아니어도 돼요.</p>
        </div>

        <Chips
          legend="성별"
          options={GENDERS.map(value => ({ value, label: GENDER_LABELS[value] }))}
          value={draft.gender}
          onChange={gender => onChange(d => ({ ...d, gender }))}
        />
        <Chips
          legend="연령대"
          options={AGE_BANDS.map(value => ({ value, label: AGE_BAND_LABELS[value] }))}
          value={draft.ageBand}
          onChange={ageBand => onChange(d => ({ ...d, ageBand }))}
        />
      </div>

      <button type="submit" className={primaryButton} disabled={!valid}>
        {resumable ? '이어서 하기' : '시작하기'}
      </button>
    </form>
  );
}

// 선택 입력. 다시 누르면 선택이 풀린다.
function Chips({
  legend, options, value, onChange,
}: {
  legend: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-base font-semibold">
        {legend} <span className="font-normal text-zinc-500">· 선택 안 해도 돼요</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(value === option.value ? null : option.value)}
            className={`min-h-11 rounded-full border-2 px-4 text-base font-medium ${
              value === option.value
                ? 'border-violet-600 bg-violet-50 text-violet-900'
                : 'border-zinc-200 bg-white text-zinc-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
