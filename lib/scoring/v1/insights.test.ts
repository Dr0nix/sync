import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COMBO_RULES, EXTREME_RULES, PARADOX_RULES, TYPE_CONTENT,
  type InsightRule,
} from './content.ts';
import { MAX_INSIGHTS, MAX_PARADOXES, ruleStrength, selectInsights } from './insights.ts';
import { AXES, TYPE_IDS, type Axes } from './prototypes.ts';

const axes = (value: number, overrides: Partial<Axes> = {}): Axes => ({
  novelty: value, structure: value, social: value,
  spend: value, stimulation: value, independence: value,
  ...overrides,
});

describe('ruleStrength', () => {
  const rule: InsightRule = {
    id: 't', text: 't',
    when: [{ axis: 'novelty', op: '>', value: 70 }, { axis: 'structure', op: '<', value: 35 }],
  };

  it('조건을 전부 만족하면 가장 아슬아슬한 조건의 여유분이다', () => {
    assert.equal(ruleStrength(axes(50, { novelty: 90, structure: 30 }), rule), 5);
  });

  it('하나라도 만족하지 않으면 null이다', () => {
    assert.equal(ruleStrength(axes(50, { novelty: 90 }), rule), null);
  });

  it('임계값과 같으면 만족하지 않는다', () => {
    assert.equal(ruleStrength(axes(50, { novelty: 70, structure: 30 }), rule), null);
  });
});

describe('selectInsights', () => {
  it('어떤 점수에서도 insights는 MAX_INSIGHTS개다', () => {
    for (const typeId of TYPE_IDS) {
      for (const v of [0, 20, 50, 80, 100]) {
        assert.equal(selectInsights(axes(v), typeId).insights.length, MAX_INSIGHTS);
      }
    }
  });

  it('맞는 룰이 없으면 타입 기본 설명으로 채운다', () => {
    const { insights, paradoxes } = selectInsights(axes(50), 'balance_player');
    assert.deepEqual(insights, TYPE_CONTENT.balance_player.descriptions.slice(0, MAX_INSIGHTS));
    assert.deepEqual(paradoxes, []);
  });

  it('조합 룰이 극단점수 룰과 타입 설명보다 먼저 온다', () => {
    const user = axes(50, { novelty: 90, structure: 10 });
    const { insights } = selectInsights(user, 'spontaneous_explorer');
    const combo = COMBO_RULES.find(r => r.id === 'combo_novelty_spontaneous')!;
    assert.equal(insights[0], combo.text);
    assert.ok(insights.includes(EXTREME_RULES.find(r => r.id === 'extreme_novelty_high')!.text));
  });

  it('같은 문장이 두 번 나오지 않는다', () => {
    const { insights } = selectInsights(axes(50, { novelty: 95, structure: 5, spend: 95 }), 'spontaneous_explorer');
    assert.equal(new Set(insights).size, insights.length);
  });

  it('paradoxes는 MAX_PARADOXES개를 넘지 않는다', () => {
    const user = axes(50, { novelty: 95, stimulation: 5, spend: 5, structure: 5 });
    const { paradoxes } = selectInsights(user, 'mood_hunter');
    assert.ok(paradoxes.length > 0 && paradoxes.length <= MAX_PARADOXES);
  });
});

// 문장 데이터를 고칠 때 깨지면 안 되는 최소 조건
describe('문장 데이터 정합성', () => {
  it('모든 타입에 이름·한 줄 카피·설명 MAX_INSIGHTS개 이상이 있다', () => {
    assert.deepEqual(Object.keys(TYPE_CONTENT).sort(), [...TYPE_IDS].sort());
    for (const id of TYPE_IDS) {
      const c = TYPE_CONTENT[id];
      assert.ok(c.name && c.tagline, id);
      assert.ok(c.descriptions.length >= MAX_INSIGHTS, id);
    }
  });

  it('룰 id는 겹치지 않고 조건은 0~100 범위의 실제 축을 쓴다', () => {
    const rules = [...COMBO_RULES, ...EXTREME_RULES, ...PARADOX_RULES];
    assert.equal(new Set(rules.map(r => r.id)).size, rules.length);
    for (const r of rules) {
      assert.ok(r.text && r.when.length > 0, r.id);
      for (const c of r.when) {
        assert.ok(AXES.includes(c.axis), r.id);
        assert.ok(c.value >= 0 && c.value <= 100, r.id);
      }
    }
  });

  it('모든 룰은 만족시킬 수 있는 점수가 존재한다', () => {
    for (const r of [...COMBO_RULES, ...EXTREME_RULES, ...PARADOX_RULES]) {
      const user = axes(50);
      for (const c of r.when) user[c.axis] = c.op === '>' ? 100 : 0;
      assert.notEqual(ruleStrength(user, r), null, r.id);
    }
  });
});
