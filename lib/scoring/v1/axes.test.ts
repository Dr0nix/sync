import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { computeAxes, type QuestionMeta } from './axes.ts';
import { AXES } from './prototypes.ts';
import { QUESTION_KEYS } from './question-keys.ts';

const q = (id: string, axis: QuestionMeta['axis'], scoringKey: Record<string, number>): QuestionMeta =>
  ({ id, category: 'travel', axis, scoringKey });

const QUESTIONS: QuestionMeta[] = [
  q('n1', 'novelty', { a: 100, b: 0 }),
  q('n2', 'novelty', { a: 0, b: 100 }),   // 역방향
  q('n3', 'novelty', { a: 100, b: 0 }),
  q('s1', 'spend', { a: 20, b: 50, c: 40, d: 100 }),
];

describe('computeAxes', () => {
  it('축별로 기여값을 평균한다', () => {
    const axes = computeAxes([
      { questionId: 'n1', answer: 'a' },
      { questionId: 'n2', answer: 'a' },
      { questionId: 'n3', answer: 'a' },
    ], QUESTIONS);
    assert.equal(axes.novelty, 67);   // (100 + 0 + 100) / 3 반올림
  });

  it('역방향 문항은 scoring_key대로 뒤집혀 반영된다', () => {
    const axes = computeAxes([
      { questionId: 'n1', answer: 'a' },
      { questionId: 'n2', answer: 'b' },
    ], QUESTIONS);
    assert.equal(axes.novelty, 100);
  });

  it('4지선다는 선택지별 기여값을 쓴다', () => {
    assert.equal(computeAxes([{ questionId: 's1', answer: 'c' }], QUESTIONS).spend, 40);
  });

  it('응답이 없는 축은 50이다', () => {
    const axes = computeAxes([{ questionId: 'n1', answer: 'a' }], QUESTIONS);
    assert.equal(axes.structure, 50);
    assert.equal(axes.spend, 50);
  });

  it('모르는 문항과 scoring_key에 없는 선택지는 무시한다', () => {
    const axes = computeAxes([
      { questionId: 'n1', answer: 'a' },
      { questionId: 'n2', answer: 'z' },
      { questionId: 'unknown', answer: 'a' },
    ], QUESTIONS);
    assert.equal(axes.novelty, 100);
  });

  it('응답이 없으면 전 축이 50이다', () => {
    const axes = computeAxes([], QUESTIONS);
    for (const k of AXES) assert.equal(axes[k], 50);
  });
});

// 매핑을 고칠 때 깨지면 안 되는 최소 조건
describe('QUESTION_KEYS 정합성', () => {
  type SeedQuestion = { code: string; response_type: 'binary' | 'quad' };
  const seed: SeedQuestion[] = JSON.parse(
    readFileSync(join(import.meta.dirname, '..', '..', '..', 'db', 'seed', 'questions.v1.json'), 'utf8'),
  );

  it('seed 문항과 매핑의 code가 1:1로 맞는다', () => {
    assert.deepEqual(Object.keys(QUESTION_KEYS).sort(), seed.map(s => s.code).sort());
  });

  it('선택지 구성이 응답 유형과 맞고 기여값은 0~100이다', () => {
    for (const s of seed) {
      const { scoringKey } = QUESTION_KEYS[s.code];
      const expected = s.response_type === 'quad' ? ['a', 'b', 'c', 'd'] : ['a', 'b'];
      assert.deepEqual(Object.keys(scoringKey).sort(), expected, s.code);
      for (const v of Object.values(scoringKey)) assert.ok(v >= 0 && v <= 100, s.code);
    }
  });

  it('모든 축에 정방향·역방향 문항이 둘 다 있다', () => {
    for (const axis of AXES) {
      const keys = Object.values(QUESTION_KEYS).filter(k => k.axis === axis);
      assert.ok(keys.some(k => k.scoringKey.a > k.scoringKey.b), `${axis} 정방향`);
      assert.ok(keys.some(k => k.scoringKey.a < k.scoringKey.b), `${axis} 역방향`);
    }
  });
});
