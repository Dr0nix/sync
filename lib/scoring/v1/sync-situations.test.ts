import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { CATEGORIES, CLASH_MAX, GOOD_MIN, SITUATIONS } from './sync-content.ts';
import { MAX_SITUATIONS, selectSituations } from './sync-situations.ts';

describe('selectSituations', () => {
  it('일치율이 높은 영역과 낮은 영역의 문장을 고른다', () => {
    const { goodAt, clashAt } = selectSituations({ food: 100, travel: 60, leisure: 20 });
    assert.deepEqual(goodAt, [SITUATIONS.food.good]);
    assert.deepEqual(clashAt, [SITUATIONS.leisure.clash]);
  });

  it('임계값에 걸친 값은 포함한다', () => {
    const { goodAt, clashAt } = selectSituations({ food: GOOD_MIN, travel: CLASH_MAX });
    assert.deepEqual(goodAt, [SITUATIONS.food.good]);
    assert.deepEqual(clashAt, [SITUATIONS.travel.clash]);
  });

  it('가장 높은(낮은) 영역부터 MAX_SITUATIONS개까지다', () => {
    const scores = { food: 80, travel: 100, leisure: 90, spend: 10, life: 30, social: 0 };
    const { goodAt, clashAt } = selectSituations(scores);
    assert.deepEqual(goodAt, [SITUATIONS.travel.good, SITUATIONS.leisure.good]);
    assert.deepEqual(clashAt, [SITUATIONS.social.clash, SITUATIONS.spend.clash]);
    assert.ok(goodAt.length <= MAX_SITUATIONS && clashAt.length <= MAX_SITUATIONS);
  });

  it('전부 잘 맞으면 갈리는 상황이 없고, 전부 안 맞으면 잘 맞는 상황이 없다', () => {
    const all = (v: number) => Object.fromEntries(CATEGORIES.map(c => [c, v]));
    assert.deepEqual(selectSituations(all(100)).clashAt, []);
    assert.deepEqual(selectSituations(all(0)).goodAt, []);
  });

  it('어중간한 점수뿐이면 둘 다 비어 있다', () => {
    assert.deepEqual(selectSituations({ food: 60, travel: 65 }), { goodAt: [], clashAt: [] });
  });

  it('점수가 없는 영역과 모르는 영역은 건너뛴다', () => {
    assert.deepEqual(selectSituations({ unknown: 100 }), { goodAt: [], clashAt: [] });
    assert.deepEqual(selectSituations({}), { goodAt: [], clashAt: [] });
  });

  it('점수가 같으면 CATEGORIES 순서를 따른다', () => {
    const { goodAt } = selectSituations({ social: 100, food: 100, travel: 100 });
    assert.deepEqual(goodAt, [SITUATIONS.food.good, SITUATIONS.travel.good]);
  });
});

describe('SYNC 문구 데이터 정합성', () => {
  it('모든 카테고리에 두 종류 문장이 있고 임계값이 겹치지 않는다', () => {
    for (const c of CATEGORIES) assert.ok(SITUATIONS[c].good && SITUATIONS[c].clash, c);
    assert.ok(CLASH_MAX < GOOD_MIN);
  });

  it('seed 문항의 category가 전부 CATEGORIES 안에 있다', () => {
    const seed: { code: string; category: string }[] = JSON.parse(
      readFileSync(join(import.meta.dirname, '..', '..', '..', 'db', 'seed', 'questions.v1.json'), 'utf8'),
    );
    const known: readonly string[] = CATEGORIES;
    for (const q of seed) assert.ok(known.includes(q.category), q.code);
  });
});
