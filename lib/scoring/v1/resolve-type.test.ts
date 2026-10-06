// 실행: node --test
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  AXES, BALANCE_BAND, PROTOTYPES, SUBTYPE_GAP, TYPE_IDS,
  type Axes, type Prototype, type TypeId,
} from './prototypes.ts';
import { resolveType, weightedDistance } from './resolve-type.ts';

const axes = (value: number, overrides: Partial<Axes> = {}): Axes => ({
  novelty: value, structure: value, social: value,
  spend: value, stimulation: value, independence: value,
  ...overrides,
});

// PROTOTYPES는 임시값이라 계속 바뀐다. 판정 규칙은 고정 fixture로 검증한다.
// 지정하지 않은 타입은 경쟁에 끼지 못하도록 범위 밖 좌표에 둔다.
const FAR: Prototype = { vector: axes(-1000), weights: axes(1) };
const fixture = (overrides: Partial<Record<TypeId, Prototype>>): Record<TypeId, Prototype> => ({
  ...Object.fromEntries(TYPE_IDS.map(id => [id, FAR])) as Record<TypeId, Prototype>,
  ...overrides,
});

describe('weightedDistance', () => {
  it('좌표가 같으면 0이다', () => {
    const p: Prototype = { vector: axes(70), weights: axes(1) };
    assert.equal(weightedDistance(axes(70), p), 0);
  });

  it('가중치가 균등하면 전 축이 10씩 어긋날 때 10이다', () => {
    const p: Prototype = { vector: axes(60), weights: axes(1) };
    assert.equal(weightedDistance(axes(50), p), 10);
  });

  it('가중치 합으로 나누므로 가중치 전체를 키워도 거리가 같다', () => {
    const user = axes(50, { novelty: 80, spend: 20 });
    const vector = axes(60, { structure: 90 });
    const weights = { novelty: 1.5, structure: 2, social: 0.5, spend: 2, stimulation: 1, independence: 0.3 };
    const scaled = Object.fromEntries(AXES.map(k => [k, weights[k] * 10])) as Axes;
    const d1 = weightedDistance(user, { vector, weights });
    const d2 = weightedDistance(user, { vector, weights: scaled });
    assert.ok(Math.abs(d1 - d2) < 1e-9);
  });

  it('가중치가 큰 축이 어긋나면 작은 축이 어긋날 때보다 멀다', () => {
    const p: Prototype = { vector: axes(50), weights: axes(1, { structure: 3, independence: 0.2 }) };
    const heavy = weightedDistance(axes(50, { structure: 80 }), p);
    const light = weightedDistance(axes(50, { independence: 80 }), p);
    assert.ok(heavy > light);
  });

  it('가중치 0인 축은 거리에 반영되지 않는다', () => {
    const p: Prototype = { vector: axes(50), weights: axes(1, { social: 0 }) };
    assert.equal(weightedDistance(axes(50, { social: 100 }), p), 0);
  });
});

describe('resolveType — balance_player 규칙', () => {
  it('전 축이 50이면 balance_player이고 subtype은 없다', () => {
    assert.deepEqual(resolveType(axes(50)), { typeId: 'balance_player', subtypeId: null });
  });

  it('전 축이 밴드 안쪽 끝이면 balance_player다', () => {
    assert.equal(resolveType(axes(50 + BALANCE_BAND - 1)).typeId, 'balance_player');
    assert.equal(resolveType(axes(50 - BALANCE_BAND + 1)).typeId, 'balance_player');
  });

  it('한 축이라도 밴드 경계에 닿으면 balance_player가 아니다', () => {
    assert.notEqual(resolveType(axes(50, { novelty: 50 + BALANCE_BAND })).typeId, 'balance_player');
    assert.notEqual(resolveType(axes(50, { spend: 50 - BALANCE_BAND })).typeId, 'balance_player');
  });

  it('balance_player는 가장 가까워도 거리 경쟁에서 뽑히지 않는다', () => {
    const prototypes = fixture({
      balance_player: { vector: axes(50), weights: axes(1) },
      comfort_first: { vector: axes(0), weights: axes(1) },
      routine_lover: { vector: axes(100), weights: axes(1) },
    });
    const { typeId, subtypeId } = resolveType(axes(50, { novelty: 50 + BALANCE_BAND }), prototypes);
    assert.notEqual(typeId, 'balance_player');
    assert.notEqual(subtypeId, 'balance_player');
  });
});

describe('resolveType — 거리 경쟁과 subtype', () => {
  // novelty 축만 보는 두 타입. 거리는 novelty 차이 그대로다.
  const noveltyOnly = axes(0, { novelty: 1 });
  const prototypes = fixture({
    mood_hunter: { vector: axes(50, { novelty: 60 }), weights: noveltyOnly },
    comfort_first: { vector: axes(50, { novelty: 40 }), weights: noveltyOnly },
  });
  // structure는 두 타입 모두 가중치 0이라 balance_player 규칙만 피하는 용도다.
  const userAt = (novelty: number) => axes(50, { novelty, structure: 90 });

  it('가장 가까운 Prototype의 타입을 고른다', () => {
    assert.equal(resolveType(userAt(58), prototypes).typeId, 'mood_hunter');
    assert.equal(resolveType(userAt(42), prototypes).typeId, 'comfort_first');
  });

  it('1·2등 거리 차가 SUBTYPE_GAP 미만이면 2등이 subtype이다', () => {
    // 거리 차 = 2 × (novelty - 50) = 0.8 × SUBTYPE_GAP
    const result = resolveType(userAt(50 + SUBTYPE_GAP * 0.4), prototypes);
    assert.deepEqual(result, { typeId: 'mood_hunter', subtypeId: 'comfort_first' });
  });

  it('1·2등 거리 차가 SUBTYPE_GAP 이상이면 subtype이 없다', () => {
    // 거리 차 = 2 × SUBTYPE_GAP
    const result = resolveType(userAt(50 + SUBTYPE_GAP), prototypes);
    assert.deepEqual(result, { typeId: 'mood_hunter', subtypeId: null });
  });
});

// 좌표·가중치를 고칠 때 깨지면 안 되는 최소 조건
describe('PROTOTYPES 정합성', () => {
  it('12개 타입이 모두 정의돼 있다', () => {
    assert.deepEqual(Object.keys(PROTOTYPES).sort(), [...TYPE_IDS].sort());
  });

  for (const id of TYPE_IDS) {
    const p = PROTOTYPES[id];

    it(`${id}: 좌표는 0~100, 가중치는 음수가 아니고 합이 0보다 크다`, () => {
      for (const k of AXES) {
        assert.ok(p.vector[k] >= 0 && p.vector[k] <= 100, `vector.${k}`);
        assert.ok(p.weights[k] >= 0, `weights.${k}`);
      }
      assert.ok(AXES.reduce((sum, k) => sum + p.weights[k], 0) > 0);
    });

    if (id === 'balance_player') continue;

    it(`${id}: 자기 좌표에 있는 사용자는 그 타입으로 판정된다`, () => {
      assert.equal(resolveType(p.vector).typeId, id);
    });
  }
});
