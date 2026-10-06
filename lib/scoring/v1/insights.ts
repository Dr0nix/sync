import {
  COMBO_RULES, EXTREME_RULES, PARADOX_RULES, TYPE_CONTENT,
  type InsightRule,
} from './content.ts';
import type { Axes, TypeId } from './prototypes.ts';

export const MAX_INSIGHTS = 3;    // 나를 설명하는 3가지 (스펙 §9)
export const MAX_PARADOXES = 2;   // 내 안의 이상한 조합 1~2개

// 조건을 전부 만족하면 임계값을 얼마나 넘겼는지(가장 아슬아슬한 조건 기준)를, 아니면 null을 돌려준다.
export function ruleStrength(axes: Axes, rule: InsightRule): number | null {
  let min = Infinity;
  for (const c of rule.when) {
    const margin = c.op === '>' ? axes[c.axis] - c.value : c.value - axes[c.axis];
    if (margin <= 0) return null;
    min = Math.min(min, margin);
  }
  return min;
}

// 만족한 룰을 강한 순서로. 강도가 같으면 데이터에 적힌 순서를 유지한다.
function matched(axes: Axes, rules: InsightRule[]): string[] {
  return rules
    .map(rule => ({ rule, strength: ruleStrength(axes, rule) }))
    .filter((m): m is { rule: InsightRule; strength: number } => m.strength !== null)
    .sort((a, b) => b.strength - a.strength)
    .map(m => m.rule.text);
}

// insights는 조합 → 극단점수 → 타입 기본 설명 순으로 채워서 항상 MAX_INSIGHTS개가 되게 한다.
export function selectInsights(axes: Axes, typeId: TypeId): { insights: string[]; paradoxes: string[] } {
  const candidates = [
    ...matched(axes, COMBO_RULES),
    ...matched(axes, EXTREME_RULES),
    ...TYPE_CONTENT[typeId].descriptions,
  ];
  return {
    insights: [...new Set(candidates)].slice(0, MAX_INSIGHTS),
    paradoxes: matched(axes, PARADOX_RULES).slice(0, MAX_PARADOXES),
  };
}
