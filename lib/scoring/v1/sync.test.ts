import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { QuestionMeta, ResponseItem } from './axes.ts';
import { computeSync } from './sync.ts';

const q = (id: string, category: string, quad = false): QuestionMeta => ({
  id, category, axis: 'novelty',
  scoringKey: quad ? { a: 0, b: 30, c: 60, d: 100 } : { a: 100, b: 0 },
});

const QUESTIONS: QuestionMeta[] = [
  q('f1', 'food'), q('f2', 'food'), q('f3', 'food'), q('f4', 'food'),
  q('t1', 'travel'), q('t2', 'travel', true),
  q('s1', 'social'), q('s2', 'social'),
];

const answers = (map: Record<string, string>): ResponseItem[] =>
  Object.entries(map).map(([questionId, answer]) => ({ questionId, answer }));

const ALL_A = answers(Object.fromEntries(QUESTIONS.map(x => [x.id, 'a'])));

describe('computeSync — 전체 점수', () => {
  it('전부 같으면 100, 전부 다르면 0이다', () => {
    const allB = answers(Object.fromEntries(QUESTIONS.map(x => [x.id, 'b'])));
    assert.equal(computeSync(ALL_A, ALL_A, QUESTIONS).score, 100);
    assert.equal(computeSync(ALL_A, allB, QUESTIONS).score, 0);
  });

  it('같은 문항 수 / 비교가능 문항 수를 반올림한다', () => {
    const b = answers({ f1: 'a', f2: 'a', f3: 'a', f4: 'b', t1: 'b', t2: 'a', s1: 'b', s2: 'a' });
    const result = computeSync(ALL_A, b, QUESTIONS);
    assert.equal(result.comparable, 8);
    assert.equal(result.score, 63);   // 5 / 8 = 62.5
  });

  it('한쪽만 답한 문항은 분모에서 뺀다', () => {
    const b = answers({ f1: 'a', f2: 'b' });
    const result = computeSync(ALL_A, b, QUESTIONS);
    assert.equal(result.comparable, 2);
    assert.equal(result.score, 50);
  });

  it('4지선다도 같은 선택지일 때만 일치다', () => {
    const only = [q('t2', 'travel', true)];
    assert.equal(computeSync(answers({ t2: 'c' }), answers({ t2: 'c' }), only).score, 100);
    assert.equal(computeSync(answers({ t2: 'c' }), answers({ t2: 'd' }), only).score, 0);
  });

  it('questions에 없는 문항의 응답은 무시한다', () => {
    const extra = answers({ f1: 'a', gone: 'a' });
    assert.equal(computeSync(extra, extra, QUESTIONS).comparable, 1);
  });

  it('비교가능 문항이 없으면 0점이고 카테고리 점수가 비어 있다', () => {
    const result = computeSync(answers({ f1: 'a' }), answers({ f2: 'a' }), QUESTIONS);
    assert.deepEqual(result, { score: 0, comparable: 0, categoryScores: {} });
  });

  it('두 사람의 순서를 바꿔도 점수가 같다', () => {
    const b = answers({ f1: 'a', f2: 'b', t1: 'b', s1: 'a' });
    assert.deepEqual(computeSync(ALL_A, b, QUESTIONS), computeSync(b, ALL_A, QUESTIONS));
  });
});

describe('computeSync — 카테고리별 점수', () => {
  it('카테고리 안에서의 일치율이다', () => {
    const b = answers({ f1: 'a', f2: 'a', f3: 'a', f4: 'b', t1: 'b', t2: 'b', s1: 'a', s2: 'a' });
    assert.deepEqual(computeSync(ALL_A, b, QUESTIONS).categoryScores, { food: 75, travel: 0, social: 100 });
  });

  it('비교가능 문항이 없는 카테고리는 들어가지 않는다', () => {
    const b = answers({ f1: 'a', s1: 'b' });
    assert.deepEqual(computeSync(ALL_A, b, QUESTIONS).categoryScores, { food: 100, social: 0 });
  });
});
