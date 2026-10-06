import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MAX_ITEMS, pickSpread } from './sync-items.ts';

const item = (questionId: string, category: string) => ({ questionId, category });

const many = (category: string, n: number) =>
  Array.from({ length: n }, (_, i) => item(`${category}-${i}`, category));

describe('pickSpread', () => {
  it('기본으로 최대 MAX_ITEMS개를 고른다', () => {
    assert.equal(pickSpread(many('food', 20), 's').length, MAX_ITEMS);
    assert.equal(pickSpread(many('food', 3), 's').length, 3);
    assert.deepEqual(pickSpread([], 's'), []);
  });

  it('카테고리가 충분하면 서로 다른 카테고리에서 하나씩 고른다', () => {
    const candidates = ['food', 'travel', 'leisure', 'spend', 'life', 'social'].flatMap(c => many(c, 4));
    const picked = pickSpread(candidates, 's');
    assert.equal(new Set(picked.map(p => p.category)).size, MAX_ITEMS);
  });

  it('카테고리가 모자라면 돌아가며 채운다', () => {
    const picked = pickSpread([...many('food', 10), ...many('travel', 1)], 's');
    assert.deepEqual(picked.map(p => p.category), ['food', 'travel', 'food', 'food', 'food']);
  });

  it('후보 순서가 달라도 같은 seed면 결과가 같다', () => {
    const candidates = [...many('food', 6), ...many('social', 6), ...many('life', 6)];
    assert.deepEqual(pickSpread(candidates, 'seed-1'), pickSpread([...candidates].reverse(), 'seed-1'));
  });

  it('seed가 다르면 고르는 문항이 달라진다', () => {
    const candidates = many('food', 30);
    const picks = new Set(
      Array.from({ length: 20 }, (_, i) => pickSpread(candidates, `seed-${i}`).map(p => p.questionId).join()),
    );
    assert.ok(picks.size > 1);
  });

  it('같은 문항을 두 번 고르지 않는다', () => {
    const picked = pickSpread([...many('food', 2), ...many('travel', 2)], 's');
    assert.equal(new Set(picked.map(p => p.questionId)).size, picked.length);
    assert.equal(picked.length, 4);
  });

  it('모르는 카테고리도 빠뜨리지 않는다', () => {
    const picked = pickSpread([item('x1', 'unknown'), item('f1', 'food')], 's');
    assert.deepEqual(picked.map(p => p.questionId), ['f1', 'x1']);
  });
});
