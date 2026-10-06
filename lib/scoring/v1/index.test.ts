import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { scoreProfile, type QuestionMeta, type ResponseItem } from './index.ts';
import { MAX_INSIGHTS } from './insights.ts';
import { AXES, TYPE_IDS } from './prototypes.ts';
import { QUESTION_KEYS } from './question-keys.ts';

// seed 문항 + 임시 매핑으로 실제 60문항과 같은 구성을 만든다. id는 code를 그대로 쓴다.
const seed: { code: string; category: string }[] = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', '..', '..', 'db', 'seed', 'questions.v1.json'), 'utf8'),
);
const QUESTIONS: QuestionMeta[] = seed.map(s => ({ id: s.code, category: s.category, ...QUESTION_KEYS[s.code] }));

// 각 문항에서 기여값이 가장 큰(또는 가장 작은) 선택지를 고른 응답
const answerAll = (pick: 'max' | 'min'): ResponseItem[] =>
  QUESTIONS.map(q => {
    const sorted = Object.entries(q.scoringKey).sort((a, b) => a[1] - b[1]);
    return { questionId: q.id, answer: (pick === 'max' ? sorted[sorted.length - 1] : sorted[0])[0] };
  });

describe('scoreProfile', () => {
  it('60문항에 전부 오른쪽 Pole로 답하면 전 축이 100이다', () => {
    const { axes } = scoreProfile(answerAll('max'), QUESTIONS);
    for (const k of AXES) assert.equal(axes[k], 100, k);
  });

  it('전부 왼쪽 Pole로 답하면 전 축이 낮다', () => {
    const { axes } = scoreProfile(answerAll('min'), QUESTIONS);
    for (const k of AXES) assert.ok(axes[k] <= 10, k);
  });

  it('타입 하나와 insights MAX_INSIGHTS개를 돌려준다', () => {
    const result = scoreProfile(answerAll('max'), QUESTIONS);
    assert.ok(TYPE_IDS.includes(result.typeId));
    assert.notEqual(result.typeId, 'balance_player');
    assert.equal(result.insights.length, MAX_INSIGHTS);
    assert.ok(result.subtypeId === null || TYPE_IDS.includes(result.subtypeId));
  });

  it('응답이 없으면 전 축 50이고 balance_player다', () => {
    const result = scoreProfile([], QUESTIONS);
    assert.equal(result.typeId, 'balance_player');
    assert.equal(result.subtypeId, null);
  });

  it('같은 입력이면 결과가 같다', () => {
    assert.deepEqual(scoreProfile(answerAll('max'), QUESTIONS), scoreProfile(answerAll('max'), QUESTIONS));
  });
});
