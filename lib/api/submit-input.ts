// POST /api/test/submit 본문 검증. 프레임워크 비의존 순수 함수.
import type { QuestionMeta, ResponseItem } from '../scoring/v1/axes.ts';

// TODO: 확정 필요 — 임시값 (성별·연령대 선택지)
export const GENDERS = ['male', 'female', 'other'] as const;
export const AGE_BANDS = ['10s', '20s', '30s', '40s_plus'] as const;

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 12;

export type SubmitInput = {
  anonymousToken: string;
  nickname: string;
  gender: typeof GENDERS[number] | null;
  ageBand: typeof AGE_BANDS[number] | null;
  answers: ResponseItem[];
};

export type ParseResult =
  | { ok: true; value: SubmitInput }
  | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

const fail = (error: string): ParseResult => ({ ok: false, error });

// 선택 입력: 없으면 null, 있으면 허용된 값이어야 한다.
function optional<T extends string>(value: unknown, allowed: readonly T[]): T | null | undefined {
  if (value === undefined || value === null) return null;
  return allowed.includes(value as T) ? (value as T) : undefined;
}

// questions는 지금 활성인 문항 전체. 응답은 이 문항들과 정확히 1:1이어야 한다.
// 본문에 점수나 타입이 들어 있어도 읽지 않는다(스펙 §6.1).
export function parseSubmit(body: unknown, questions: QuestionMeta[]): ParseResult {
  if (typeof body !== 'object' || body === null) return fail('요청 본문이 올바르지 않습니다.');
  const b = body as Record<string, unknown>;

  if (!isUuid(b.anonymousToken)) return fail('anonymousToken이 올바르지 않습니다.');

  if (typeof b.nickname !== 'string') return fail('닉네임을 입력해 주세요.');
  const nickname = b.nickname.trim();
  const length = [...nickname].length;
  if (length < NICKNAME_MIN || length > NICKNAME_MAX) {
    return fail(`닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자로 입력해 주세요.`);
  }

  const gender = optional(b.gender, GENDERS);
  if (gender === undefined) return fail('gender 값이 올바르지 않습니다.');
  const ageBand = optional(b.ageBand, AGE_BANDS);
  if (ageBand === undefined) return fail('ageBand 값이 올바르지 않습니다.');

  if (!Array.isArray(b.answers)) return fail('answers가 올바르지 않습니다.');
  const byId = new Map(questions.map(q => [q.id, q]));
  const seen = new Set<string>();
  const answers: ResponseItem[] = [];

  for (const item of b.answers as unknown[]) {
    if (typeof item !== 'object' || item === null) return fail('answers가 올바르지 않습니다.');
    const { questionId, answer } = item as Record<string, unknown>;
    if (typeof questionId !== 'string' || typeof answer !== 'string') return fail('answers가 올바르지 않습니다.');

    const question = byId.get(questionId);
    if (!question) return fail('알 수 없는 문항이 포함돼 있습니다.');
    if (seen.has(questionId)) return fail('같은 문항에 응답이 두 번 들어 있습니다.');
    if (!Object.hasOwn(question.scoringKey, answer)) return fail('문항에 없는 선택지가 포함돼 있습니다.');

    seen.add(questionId);
    answers.push({ questionId, answer });
  }

  if (seen.size !== questions.length) return fail('모든 문항에 응답해야 합니다.');

  return { ok: true, value: { anonymousToken: b.anonymousToken.toLowerCase(), nickname, gender, ageBand, answers } };
}
