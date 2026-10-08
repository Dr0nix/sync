// 테스트 진행 상태(응답 버퍼). localStorage에 그대로 저장되는 순수 데이터와 그 전이 함수.
import type { TestQuestion } from './types.ts';

export const INTERMISSION_EVERY = 20;

export type Draft = {
  version: number;
  nickname: string;
  gender: string | null;
  ageBand: string | null;
  started: boolean;                  // 닉네임 입력을 마치고 문항에 들어갔는지
  index: number;                     // 지금 보고 있는 문항 위치. 문항 수와 같으면 전부 답한 상태
  answers: Record<string, string>;   // questionId → 선택지 key
};

export const emptyDraft = (version: number): Draft => ({
  version, nickname: '', gender: null, ageBand: null, started: false, index: 0, answers: {},
});

// 저장된 값을 지금 문항 구성에 맞춰 되살린다.
// 버전이 다르거나 깨진 값이면 처음부터, 없어진 문항·선택지의 응답은 버린다.
export function restoreDraft(raw: string | null, questions: TestQuestion[], version: number): Draft {
  if (!raw) return emptyDraft(version);
  let saved: Partial<Draft>;
  try {
    saved = JSON.parse(raw);
  } catch {
    return emptyDraft(version);
  }
  if (typeof saved !== 'object' || saved === null || saved.version !== version) return emptyDraft(version);

  const answers: Record<string, string> = {};
  const savedAnswers = typeof saved.answers === 'object' && saved.answers !== null ? saved.answers : {};
  for (const q of questions) {
    const key = savedAnswers[q.id];
    if (q.options.some(o => o.key === key)) answers[q.id] = key;
  }

  const draft: Draft = {
    version,
    nickname: typeof saved.nickname === 'string' ? saved.nickname : '',
    gender: typeof saved.gender === 'string' ? saved.gender : null,
    ageBand: typeof saved.ageBand === 'string' ? saved.ageBand : null,
    started: saved.started === true,
    index: 0,
    answers,
  };
  // 답하지 않은 문항을 건너뛴 위치로는 돌아가지 않는다.
  const reachable = firstUnanswered(draft, questions);
  const index = Number.isInteger(saved.index) ? (saved.index as number) : reachable;
  return { ...draft, index: Math.min(Math.max(index, 0), reachable) };
}

export function firstUnanswered(draft: Draft, questions: TestQuestion[]): number {
  const i = questions.findIndex(q => !(q.id in draft.answers));
  return i === -1 ? questions.length : i;
}

export const isComplete = (draft: Draft, questions: TestQuestion[]): boolean =>
  firstUnanswered(draft, questions) === questions.length;

// 지금 문항에 답하고 다음 문항으로 넘어간다.
export function answerCurrent(draft: Draft, questions: TestQuestion[], key: string): Draft {
  const question = questions[draft.index];
  if (!question || !question.options.some(o => o.key === key)) return draft;
  return { ...draft, answers: { ...draft.answers, [question.id]: key }, index: draft.index + 1 };
}

// 한 문항 뒤로. 첫 문항에서는 닉네임 입력으로 돌아간다.
export function goBack(draft: Draft): Draft {
  if (draft.index === 0) return { ...draft, started: false };
  return { ...draft, index: draft.index - 1 };
}

// 방금 넘어온 위치가 인터미션 지점인지. 마지막 문항 뒤에는 넣지 않는다.
export const isIntermission = (index: number, total: number): boolean =>
  index > 0 && index < total && index % INTERMISSION_EVERY === 0;
