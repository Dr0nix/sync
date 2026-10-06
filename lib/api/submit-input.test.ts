import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { QuestionMeta } from '../scoring/v1/axes.ts';
import { parseSubmit } from './submit-input.ts';

const QUESTIONS: QuestionMeta[] = [
  { id: 'q1', category: 'travel', axis: 'novelty', scoringKey: { a: 100, b: 0 } },
  { id: 'q2', category: 'food', axis: 'spend', scoringKey: { a: 0, b: 100 } },
  { id: 'q3', category: 'travel', axis: 'stimulation', scoringKey: { a: 20, b: 50, c: 40, d: 100 } },
];
const TOKEN = '3f2b8c1e-9a4d-4e7b-8f21-0c5d6e7a8b9c';

const body = (overrides: Record<string, unknown> = {}) => ({
  anonymousToken: TOKEN,
  nickname: '지승',
  answers: [
    { questionId: 'q1', answer: 'a' },
    { questionId: 'q2', answer: 'b' },
    { questionId: 'q3', answer: 'd' },
  ],
  ...overrides,
});

const errorOf = (b: unknown) => {
  const result = parseSubmit(b, QUESTIONS);
  assert.equal(result.ok, false);
  return result.ok ? '' : result.error;
};

describe('parseSubmit', () => {
  it('정상 본문을 받아들이고 선택 입력이 없으면 null로 채운다', () => {
    const result = parseSubmit(body(), QUESTIONS);
    assert.ok(result.ok);
    assert.equal(result.value.nickname, '지승');
    assert.equal(result.value.gender, null);
    assert.equal(result.value.ageBand, null);
    assert.equal(result.value.answers.length, 3);
  });

  it('성별·연령대는 허용된 값만 받는다', () => {
    const result = parseSubmit(body({ gender: 'female', ageBand: '20s' }), QUESTIONS);
    assert.ok(result.ok);
    assert.equal(result.value.gender, 'female');
    assert.equal(result.value.ageBand, '20s');
    assert.match(errorOf(body({ gender: 'x' })), /gender/);
    assert.match(errorOf(body({ ageBand: 20 })), /ageBand/);
  });

  it('닉네임은 앞뒤 공백을 뺀 2~12자다', () => {
    const trimmed = parseSubmit(body({ nickname: '  민수  ' }), QUESTIONS);
    assert.ok(trimmed.ok && trimmed.value.nickname === '민수');
    assert.ok(parseSubmit(body({ nickname: '가'.repeat(12) }), QUESTIONS).ok);
    assert.match(errorOf(body({ nickname: '가' })), /닉네임/);
    assert.match(errorOf(body({ nickname: ' 가 ' })), /닉네임/);
    assert.match(errorOf(body({ nickname: '가'.repeat(13) })), /닉네임/);
    assert.match(errorOf(body({ nickname: 123 })), /닉네임/);
  });

  it('anonymousToken은 UUID 형식이어야 한다', () => {
    assert.match(errorOf(body({ anonymousToken: 'abc' })), /anonymousToken/);
    assert.match(errorOf(body({ anonymousToken: undefined })), /anonymousToken/);
  });

  it('문항이 하나라도 빠지면 거부한다', () => {
    assert.match(errorOf(body({ answers: [{ questionId: 'q1', answer: 'a' }] })), /모든 문항/);
  });

  it('같은 문항이 두 번 들어오면 거부한다', () => {
    const answers = [
      { questionId: 'q1', answer: 'a' },
      { questionId: 'q1', answer: 'b' },
      { questionId: 'q2', answer: 'b' },
    ];
    assert.match(errorOf(body({ answers })), /두 번/);
  });

  it('모르는 문항과 문항에 없는 선택지를 거부한다', () => {
    const base = body().answers;
    assert.match(errorOf(body({ answers: [...base.slice(0, 2), { questionId: 'zz', answer: 'a' }] })), /알 수 없는 문항/);
    assert.match(errorOf(body({ answers: [...base.slice(0, 2), { questionId: 'q3', answer: 'e' }] })), /선택지/);
    assert.match(errorOf(body({ answers: [{ questionId: 'q1', answer: 'c' }, ...base.slice(1)] })), /선택지/);
    assert.match(errorOf(body({ answers: [{ questionId: 'q1', answer: 'toString' }, ...base.slice(1)] })), /선택지/);
  });

  it('형식이 깨진 본문을 거부한다', () => {
    assert.match(errorOf(null), /본문/);
    assert.match(errorOf('text'), /본문/);
    assert.match(errorOf(body({ answers: 'a' })), /answers/);
    assert.match(errorOf(body({ answers: [null] })), /answers/);
  });

  it('본문에 점수나 타입이 들어 있어도 결과에 넣지 않는다', () => {
    const result = parseSubmit(body({ axes: { novelty: 100 }, typeId: 'planned_hedonist' }), QUESTIONS);
    assert.ok(result.ok);
    assert.deepEqual(Object.keys(result.value).sort(), ['ageBand', 'anonymousToken', 'answers', 'gender', 'nickname']);
  });
});
