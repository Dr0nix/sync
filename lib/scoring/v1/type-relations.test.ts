import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PROTOTYPES, TYPE_IDS, type Axes, type Prototype, type TypeId } from './prototypes.ts';
import { TYPE_PAGE_CONTENT } from './type-page-content.ts';
import { relatedTypes, vectorDistance } from './type-relations.ts';

const at = (values: Partial<Axes>): Prototype => ({
  vector: { novelty: 50, structure: 50, social: 50, spend: 50, stimulation: 50, independence: 50, ...values },
  weights: { novelty: 1, structure: 1, social: 1, spend: 1, stimulation: 1, independence: 1 },
});

const everyType = (p: Prototype) =>
  Object.fromEntries(TYPE_IDS.map(id => [id, p])) as Record<TypeId, Prototype>;

describe('vectorDistance', () => {
  it('좌표가 같으면 0이고, 순서를 바꿔도 같다', () => {
    const a = at({ novelty: 80 }), b = at({ structure: 20 });
    assert.equal(vectorDistance(a, a), 0);
    assert.equal(vectorDistance(a, b), vectorDistance(b, a));
    assert.equal(vectorDistance(at({ novelty: 80 }), at({ novelty: 50 })), 30);
  });
});

describe('relatedTypes', () => {
  it('balance_player는 닮은·정반대 타입이 없다', () => {
    assert.equal(relatedTypes('balance_player'), null);
  });

  it('가장 가까운 타입이 닮은 타입, 가장 먼 타입이 정반대 타입이다', () => {
    const prototypes = everyType(at({ novelty: 60 }));
    prototypes.mood_hunter = at({ novelty: 100 });
    prototypes.taste_curator = at({ novelty: 95 });
    prototypes.comfort_first = at({ novelty: 0 });
    assert.deepEqual(relatedTypes('mood_hunter', prototypes), { similar: 'taste_curator', opposite: 'comfort_first' });
  });

  it('balance_player는 가장 가깝거나 멀어도 후보에 들어가지 않는다', () => {
    const prototypes = everyType(at({ novelty: 10 }));
    prototypes.mood_hunter = at({ novelty: 52 });
    prototypes.balance_player = at({});
    const related = relatedTypes('mood_hunter', prototypes)!;
    assert.notEqual(related.similar, 'balance_player');
    assert.notEqual(related.opposite, 'balance_player');
  });

  it('실제 좌표에서 모든 타입이 자기 자신이 아닌 서로 다른 두 타입을 얻는다', () => {
    for (const id of TYPE_IDS) {
      if (id === 'balance_player') continue;
      const related = relatedTypes(id);
      assert.ok(related, id);
      assert.notEqual(related.similar, id);
      assert.notEqual(related.opposite, id);
      assert.notEqual(related.similar, related.opposite);
      assert.ok(
        vectorDistance(PROTOTYPES[id], PROTOTYPES[related.similar])
          <= vectorDistance(PROTOTYPES[id], PROTOTYPES[related.opposite]),
        id,
      );
    }
  });
});

describe('TYPE_PAGE_CONTENT 정합성', () => {
  it('12개 타입 모두 소개와 "이럴 때 티가 나요" 문단이 있다', () => {
    assert.deepEqual(Object.keys(TYPE_PAGE_CONTENT).sort(), [...TYPE_IDS].sort());
    for (const id of TYPE_IDS) {
      assert.ok(TYPE_PAGE_CONTENT[id].intro.length > 20, id);
      assert.ok(TYPE_PAGE_CONTENT[id].signs.length > 20, id);
    }
  });
});
