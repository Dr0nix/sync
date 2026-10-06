export const AXES = [
  'novelty', 'structure', 'social', 'spend', 'stimulation', 'independence',
] as const;

export type Axis = typeof AXES[number];
export type Axes = Record<Axis, number>;

export const TYPE_IDS = [
  'planned_hedonist',
  'spontaneous_explorer',
  'taste_curator',
  'premium_experiencer',
  'pragmatic_realist',
  'comfort_first',
  'weekend_wanderer',
  'people_are_content',
  'solo_deepdiver',
  'mood_hunter',
  'routine_lover',
  'balance_player',
] as const;

export type TypeId = typeof TYPE_IDS[number];

export type Prototype = {
  vector: Axes;    // 0~100
  weights: Axes;   // 그 타입을 정의하는 축일수록 크게
};

// balance_player 판정 규칙: 전 축 |x-50| < BALANCE_BAND (스펙 §3.3.1)
export const BALANCE_BAND = 15;
// 1·2등 거리 차가 이 값 미만이면 2등을 subtype으로 (스펙 §3.3.1)
// TODO: 확정 필요 — 임시값
// 현재 PROTOTYPES와 가상 분포 기준으로 subtype 비율이 15~20%가 되도록 맞춘 값이다.
// PROTOTYPES를 바꾸면 scripts/simulate-types.ts로 비율을 다시 확인할 것.
export const SUBTYPE_GAP = 1;

// TODO: 확정 필요 — 임시값
// planned_hedonist만 스펙 §3.3 예시 그대로이고, 나머지는 타입명·대표 성향(§3.4)에 맞춰 잡은 초안이다.
// 숫자를 바꾸면 scripts/inspect-prototypes.ts, scripts/simulate-types.ts를 다시 돌려 확인할 것.
export const PROTOTYPES: Record<TypeId, Prototype> = {
  // 계획↑ 경험소비↑ 새로움↑
  planned_hedonist: {
    vector:  { novelty: 75, structure: 85, social: 60, spend: 85, stimulation: 65, independence: 55 },
    weights: { novelty: 1.5, structure: 2, social: 0.5, spend: 2, stimulation: 1, independence: 0.3 },
  },
  // 즉흥↑ 새로움↑ 자극↑
  spontaneous_explorer: {
    vector:  { novelty: 82, structure: 18, social: 50, spend: 50, stimulation: 78, independence: 62 },
    weights: { novelty: 2, structure: 2, social: 0.4, spend: 0.3, stimulation: 1.5, independence: 0.5 },
  },
  // 독립↑ 새로움↑
  taste_curator: {
    vector:  { novelty: 68, structure: 60, social: 45, spend: 62, stimulation: 45, independence: 88 },
    weights: { novelty: 1.2, structure: 0.5, social: 0.5, spend: 0.7, stimulation: 0.5, independence: 2.2 },
  },
  // 경험소비↑ 새로움↑
  premium_experiencer: {
    vector:  { novelty: 60, structure: 50, social: 55, spend: 92, stimulation: 55, independence: 50 },
    weights: { novelty: 0.8, structure: 0.4, social: 0.3, spend: 2.5, stimulation: 0.6, independence: 0.3 },
  },
  // 실용↑ 계획↑ 안정↑
  pragmatic_realist: {
    vector:  { novelty: 35, structure: 75, social: 45, spend: 15, stimulation: 35, independence: 50 },
    weights: { novelty: 1, structure: 1.5, social: 0.3, spend: 2.5, stimulation: 1, independence: 0.3 },
  },
  // 익숙함↑ 편안함↑
  comfort_first: {
    vector:  { novelty: 18, structure: 32, social: 40, spend: 45, stimulation: 15, independence: 45 },
    weights: { novelty: 2, structure: 1, social: 0.5, spend: 0.4, stimulation: 2, independence: 0.3 },
  },
  // 즉흥↑ 사회↑ 활동↑
  weekend_wanderer: {
    vector:  { novelty: 58, structure: 22, social: 80, spend: 45, stimulation: 70, independence: 38 },
    weights: { novelty: 0.6, structure: 2, social: 1.8, spend: 0.3, stimulation: 1.2, independence: 0.5 },
  },
  // 사회↑ 공유↑
  people_are_content: {
    vector:  { novelty: 45, structure: 50, social: 88, spend: 50, stimulation: 50, independence: 12 },
    weights: { novelty: 0.3, structure: 0.4, social: 2, spend: 0.3, stimulation: 0.4, independence: 2 },
  },
  // 독립↑ 소수↑
  solo_deepdiver: {
    vector:  { novelty: 48, structure: 55, social: 10, spend: 45, stimulation: 35, independence: 82 },
    weights: { novelty: 0.4, structure: 0.4, social: 2.5, spend: 0.3, stimulation: 0.6, independence: 1.5 },
  },
  // 경험↑ 새로움↑ (공간·분위기 중심이라 자극은 낮게 잡음)
  mood_hunter: {
    vector:  { novelty: 80, structure: 45, social: 55, spend: 70, stimulation: 28, independence: 45 },
    weights: { novelty: 1.8, structure: 0.3, social: 0.4, spend: 1.2, stimulation: 1.8, independence: 0.3 },
  },
  // 계획↑ 익숙함↑ 편안함↑
  routine_lover: {
    vector:  { novelty: 15, structure: 85, social: 40, spend: 45, stimulation: 28, independence: 60 },
    weights: { novelty: 2, structure: 2, social: 0.3, spend: 0.4, stimulation: 1, independence: 0.5 },
  },
  // 거리 경쟁에 참여하지 않는다. resolveType()에서 규칙으로 분리.
  balance_player: {
    vector:  { novelty: 50, structure: 50, social: 50, spend: 50, stimulation: 50, independence: 50 },
    weights: { novelty: 1, structure: 1, social: 1, spend: 1, stimulation: 1, independence: 1 },
  },
};
