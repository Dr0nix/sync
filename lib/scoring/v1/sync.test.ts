import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { QuestionMeta, ResponseItem } from './axes.ts';
import { DISCLOSE_POOL, computeSync } from './sync.ts';

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
    assert.deepEqual(result, { score: 0, comparable: 0, categoryScores: {}, matched: [], mismatched: [] });
  });

  it('두 사람의 순서를 바꿔도 점수가 같다', () => {
    const b = answers({ f1: 'a', f2: 'b', t1: 'b', s1: 'a' });
    const ab = computeSync(ALL_A, b, QUESTIONS), ba = computeSync(b, ALL_A, QUESTIONS);
    assert.equal(ab.score, ba.score);
    assert.deepEqual(ab.categoryScores, ba.categoryScores);
    assert.deepEqual(ab.matched, ba.matched);
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

describe('computeSync — 공통점·차이점', () => {
  const b = answers({ f1: 'a', f2: 'a', f3: 'b', f4: 'b', t1: 'b', t2: 'd', s1: 'a', s2: 'b' });

  it('공통점에는 같이 고른 선택지를, 차이점에는 두 사람의 선택을 인자 순서대로 담는다', () => {
    const result = computeSync(ALL_A, b, QUESTIONS, 'seed');
    for (const m of result.matched) {
      assert.ok(['f1', 'f2', 's1'].includes(m.questionId));
      assert.equal(m.answer, 'a');
    }
    assert.equal(result.matched.length, 3);
    const t2 = result.mismatched.find(m => m.questionId === 't2');
    assert.deepEqual(t2, { questionId: 't2', a: 'a', b: 'd' });
  });

  it('문항 수가 많아도 5개씩만 담고 문구는 담지 않는다', () => {
    const big = Array.from({ length: 30 }, (_, i) => q(`x${i}`, ['food', 'travel', 'life'][i % 3]));
    const mine = answers(Object.fromEntries(big.map(x => [x.id, 'a'])));
    const yours = answers(Object.fromEntries(big.map((x, i) => [x.id, i % 2 ? 'a' : 'b'])));
    const result = computeSync(mine, yours, big, 'seed');
    assert.equal(result.matched.length, 5);
    assert.equal(result.mismatched.length, 5);
    assert.deepEqual(Object.keys(result.matched[0]).sort(), ['answer', 'questionId']);
    assert.deepEqual(Object.keys(result.mismatched[0]).sort(), ['a', 'b', 'questionId']);
  });

  it('seed가 바뀌어도 점수는 그대로다', () => {
    assert.equal(computeSync(ALL_A, b, QUESTIONS, 'x').score, computeSync(ALL_A, b, QUESTIONS, 'y').score);
  });
});

// 재응시로 매치를 새로 만들어도 공개되는 문항이 늘어나지 않아야 한다(스펙 §12).
describe('computeSync — 공개 풀', () => {
  const CATS = ['food', 'travel', 'leisure', 'spend', 'life', 'social'];
  const SIXTY = Array.from({ length: 60 }, (_, i) => q(`p${i}`, CATS[i % 6]));

  // 시드 고정 난수. 실행할 때마다 같은 응답 조합이 나온다.
  const randomizer = (seed: number) => () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const randomAnswers = (rand: () => number) =>
    answers(Object.fromEntries(SIXTY.map(x => [x.id, rand() < 0.5 ? 'a' : 'b'])));

  const disclosed = (seed: string, rounds: number, rand: () => number) => {
    const ids = new Set<string>();
    for (let i = 0; i < rounds; i++) {
      const result = computeSync(randomAnswers(rand), randomAnswers(rand), SIXTY, seed);
      for (const item of [...result.matched, ...result.mismatched]) ids.add(item.questionId);
    }
    return ids;
  };

  it('같은 seed면 응답을 200번 바꿔도 공개되는 문항은 DISCLOSE_POOL개 이하다', () => {
    const ids = disclosed('pair-1', 200, randomizer(1));
    assert.ok(ids.size <= DISCLOSE_POOL, `공개된 문항 ${ids.size}개`);
    assert.ok(ids.size > 5);   // 한 번에 보이는 것보다는 많이 모인다. 풀 전체가 실제로 쓰이는지 확인
  });

  it('seed가 다르면 공개 풀이 달라진다', () => {
    const x = disclosed('pair-1', 200, randomizer(1));
    const y = disclosed('pair-2', 200, randomizer(1));
    assert.notDeepEqual([...x].sort(), [...y].sort());
  });

  it('seed와 응답이 바뀌어도 점수와 카테고리 점수는 직접 센 값과 같다', () => {
    const rand = randomizer(7);
    for (let i = 0; i < 50; i++) {
      const mine = randomAnswers(rand), yours = randomAnswers(rand);
      const result = computeSync(mine, yours, SIXTY, `pair-${i}`);

      const same = SIXTY.filter((_, k) => mine[k].answer === yours[k].answer);
      assert.equal(result.score, Math.round((same.length / 60) * 100));
      for (const c of CATS) {
        const inCategory = same.filter(x => x.category === c).length;
        assert.equal(result.categoryScores[c], Math.round((inCategory / 10) * 100), c);
      }
      assert.equal(result.comparable, 60);
    }
  });

  it('공통점·차이점은 각각 5개 이하다', () => {
    const rand = randomizer(3);
    for (let i = 0; i < 50; i++) {
      const result = computeSync(randomAnswers(rand), randomAnswers(rand), SIXTY, 'pair-1');
      assert.ok(result.matched.length <= 5 && result.mismatched.length <= 5);
    }
  });
});
