import type { Axis } from './prototypes.ts';

export type QuestionKey = {
  axis: Axis;
  // 선택지 → 축 기여값(0~100). 100이 축의 오른쪽 Pole이다(스펙 §3.1).
  scoringKey: Record<string, number>;
};

// 오른쪽 Pole 쪽 선택지가 a인 문항 / b인 문항(역방향)
const A = { a: 100, b: 0 };
const B = { a: 0, b: 100 };

// TODO: 확정 필요 — 임시값
// 60문항 ↔ 6축 매핑과 scoring_key 전부가 초안이다. 문항 원문은 db/seed/questions.v1.json.
// 축별 문항 수가 고르지 않다: novelty 12 / structure 11 / social 9 / spend 13 / stimulation 8 / independence 7
// 바꾼 뒤에는 npm run db:seed로 questions 테이블에 반영하고 scripts/recompute.ts로 재채점할 것.
export const QUESTION_KEYS: Record<string, QuestionKey> = {
  // 여행 / 이동
  Q01: { axis: 'structure', scoringKey: A },
  Q02: { axis: 'spend', scoringKey: A },
  Q03: { axis: 'structure', scoringKey: B },
  Q04: { axis: 'novelty', scoringKey: A },
  Q05: { axis: 'stimulation', scoringKey: A },
  Q06: { axis: 'spend', scoringKey: A },
  Q07: { axis: 'structure', scoringKey: B },
  Q08: { axis: 'structure', scoringKey: A },
  Q09: { axis: 'novelty', scoringKey: A },
  Q10: { axis: 'stimulation', scoringKey: { a: 20, b: 50, c: 40, d: 100 } },

  // 음식 / 술
  Q11: { axis: 'novelty', scoringKey: B },
  Q12: { axis: 'novelty', scoringKey: B },
  Q13: { axis: 'spend', scoringKey: A },
  Q14: { axis: 'stimulation', scoringKey: A },
  Q15: { axis: 'stimulation', scoringKey: B },
  Q16: { axis: 'stimulation', scoringKey: A },
  Q17: { axis: 'spend', scoringKey: A },
  Q18: { axis: 'novelty', scoringKey: A },
  Q19: { axis: 'independence', scoringKey: B },
  Q20: { axis: 'structure', scoringKey: A },

  // 여가 / 주말
  Q21: { axis: 'stimulation', scoringKey: B },
  Q22: { axis: 'social', scoringKey: A },
  Q23: { axis: 'novelty', scoringKey: B },
  Q24: { axis: 'novelty', scoringKey: A },
  Q25: { axis: 'social', scoringKey: A },
  Q26: { axis: 'novelty', scoringKey: B },
  Q27: { axis: 'stimulation', scoringKey: A },
  Q28: { axis: 'stimulation', scoringKey: A },
  Q29: { axis: 'social', scoringKey: A },
  Q30: { axis: 'structure', scoringKey: A },

  // 소비 / 돈
  Q31: { axis: 'spend', scoringKey: B },
  Q32: { axis: 'spend', scoringKey: B },
  Q33: { axis: 'spend', scoringKey: A },
  Q34: { axis: 'spend', scoringKey: A },
  Q35: { axis: 'spend', scoringKey: A },
  Q36: { axis: 'novelty', scoringKey: A },
  Q37: { axis: 'spend', scoringKey: A },
  Q38: { axis: 'spend', scoringKey: A },
  Q39: { axis: 'spend', scoringKey: B },
  Q40: { axis: 'spend', scoringKey: A },

  // 관계 / 소셜
  Q41: { axis: 'social', scoringKey: A },
  Q42: { axis: 'independence', scoringKey: B },
  Q43: { axis: 'independence', scoringKey: B },
  Q44: { axis: 'social', scoringKey: A },
  Q45: { axis: 'independence', scoringKey: B },
  Q46: { axis: 'independence', scoringKey: B },
  Q47: { axis: 'social', scoringKey: A },
  Q48: { axis: 'social', scoringKey: A },
  Q49: { axis: 'social', scoringKey: A },
  Q50: { axis: 'independence', scoringKey: B },

  // 생활 / 자극 / 리듬
  Q51: { axis: 'structure', scoringKey: A },
  Q52: { axis: 'structure', scoringKey: A },
  Q53: { axis: 'structure', scoringKey: A },
  Q54: { axis: 'social', scoringKey: B },
  Q55: { axis: 'novelty', scoringKey: B },
  Q56: { axis: 'structure', scoringKey: A },
  Q57: { axis: 'structure', scoringKey: A },
  Q58: { axis: 'novelty', scoringKey: B },
  Q59: { axis: 'independence', scoringKey: A },
  Q60: { axis: 'novelty', scoringKey: A },
};
