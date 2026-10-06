import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { describe, it } from 'node:test';
import { optionOrder } from './option-order.ts';

const SEED = '3f2b8c1e-9a4d-4e7b-8f21-0c5d6e7a8b9c';

describe('optionOrder', () => {
  it('같은 (seed, questionId)는 항상 같은 순서다', () => {
    for (const count of [2, 4]) {
      assert.deepEqual(optionOrder(SEED, 'q1', count), optionOrder(SEED, 'q1', count));
    }
  });

  it('결과는 0..count-1의 순열이다', () => {
    for (const count of [2, 4]) {
      for (let i = 0; i < 200; i++) {
        const order = optionOrder(SEED, `q${i}`, count);
        assert.deepEqual([...order].sort(), Array.from({ length: count }, (_, k) => k));
      }
    }
  });

  it('한 seed로 문항 1,000개를 돌리면 원래 a가 첫 번째로 오는 비율이 40~60%다', () => {
    const ids = Array.from({ length: 1000 }, () => randomUUID());
    const aFirst = ids.filter(id => optionOrder(SEED, id, 2)[0] === 0).length;
    assert.ok(aFirst >= 400 && aFirst <= 600, `a가 첫 번째: ${aFirst} / 1000`);
  });

  it('seed가 다르면 같은 문항이라도 순서가 갈린다', () => {
    const id = randomUUID();
    const aFirst = Array.from({ length: 1000 }, () => randomUUID())
      .filter(seed => optionOrder(seed, id, 2)[0] === 0).length;
    assert.ok(aFirst >= 400 && aFirst <= 600, `a가 첫 번째: ${aFirst} / 1000`);
  });

  it('4지선다는 네 자리 모두에 원래 a가 올 수 있다', () => {
    const positions = new Set(
      Array.from({ length: 200 }, (_, i) => optionOrder(SEED, `q${i}`, 4).indexOf(0)),
    );
    assert.deepEqual([...positions].sort(), [0, 1, 2, 3]);
  });
});
