// 결과 화면에 나가는 문장 데이터. 컴포넌트나 채점 로직에 문장을 직접 쓰지 않고 여기서만 관리한다.
import type { Axis, TypeId } from './prototypes.ts';

export type TypeContent = {
  name: string;
  tagline: string;
  descriptions: string[];
};

export type Condition = { axis: Axis; op: '>' | '<'; value: number };

export type InsightRule = {
  id: string;
  when: Condition[];   // 전부 만족해야 한다
  text: string;
};

// name·tagline은 스펙 §3.4 그대로다.
// TODO: 확정 필요 — 임시값 (descriptions 전체)
export const TYPE_CONTENT: Record<TypeId, TypeContent> = {
  planned_hedonist: {
    name: '계획형 쾌락주의자',
    tagline: '놀기 위해 계획합니다.',
    descriptions: [
      '놀러 가기 전에 이미 동선이 머릿속에 있습니다.',
      '좋은 경험에는 돈을 쓰되, 실패할 확률은 미리 줄여둡니다.',
      '예약 버튼을 누르는 순간부터 이미 즐기고 있습니다.',
    ],
  },
  spontaneous_explorer: {
    name: '즉흥 탐험가',
    tagline: '일단 가면 뭔가 생깁니다.',
    descriptions: [
      '계획표보다 그날의 기분을 더 믿습니다.',
      '처음 보는 골목, 처음 보는 메뉴에 먼저 손이 갑니다.',
      '예상 밖의 일이 생겨야 제대로 놀았다고 느낍니다.',
    ],
  },
  taste_curator: {
    name: '취향 큐레이터',
    tagline: '아무거나 좋다는 말이 제일 어렵습니다.',
    descriptions: [
      '남들이 좋다는 것보다 내가 좋은 것이 먼저입니다.',
      '새로운 걸 찾아다니지만 기준은 꽤 까다롭습니다.',
      '추천을 받기보다 추천을 하는 쪽에 가깝습니다.',
    ],
  },
  premium_experiencer: {
    name: '프리미엄 경험파',
    tagline: '남는 건 결국 경험이라고 생각합니다.',
    descriptions: [
      '가격표보다 그 시간이 얼마나 좋았는지를 기억합니다.',
      '어중간한 여러 번보다 제대로 된 한 번을 고릅니다.',
      '좋은 공간, 좋은 음식 앞에서는 지갑이 관대해집니다.',
    ],
  },
  pragmatic_realist: {
    name: '가성비 현실파',
    tagline: '좋은 선택보다 납득되는 선택.',
    descriptions: [
      '쓰기 전에 이 돈이 납득되는지부터 따져봅니다.',
      '화려한 선택보다 후회 없는 선택을 좋아합니다.',
      '미리 알아보고 비교하는 시간이 아깝지 않습니다.',
    ],
  },
  comfort_first: {
    name: '안락제일주의자',
    tagline: '좋았던 데는 이유가 있습니다.',
    descriptions: [
      '검증된 단골집이 새로 생긴 핫플보다 좋습니다.',
      '쉬는 날에는 정말로 쉬어야 합니다.',
      '굳이 모험하지 않아도 충분히 즐겁습니다.',
    ],
  },
  weekend_wanderer: {
    name: '주말 방랑자',
    tagline: '집을 나서면 계획이 생깁니다.',
    descriptions: [
      '일단 나가서 누굴 만나면 그다음이 정해집니다.',
      '주말에 집에만 있으면 손해 본 기분이 듭니다.',
      '약속이 약속을 부르는 날을 좋아합니다.',
    ],
  },
  people_are_content: {
    name: '사람이 콘텐츠',
    tagline: '어디보다 누구랑이 중요합니다.',
    descriptions: [
      '장소나 메뉴는 같이 가는 사람이 정해도 괜찮습니다.',
      '좋은 일이 생기면 누군가에게 먼저 말하고 싶어집니다.',
      '혼자 본 풍경보다 같이 본 풍경을 더 오래 기억합니다.',
    ],
  },
  solo_deepdiver: {
    name: '혼놀 딥다이버',
    tagline: '혼자여도 심심할 틈이 없습니다.',
    descriptions: [
      '혼자 밥 먹고 혼자 영화 보는 게 전혀 어색하지 않습니다.',
      '여럿이 맞추는 것보다 내 속도로 가는 게 편합니다.',
      '관심 생긴 건 혼자서도 끝까지 파고듭니다.',
    ],
  },
  mood_hunter: {
    name: '분위기 사냥꾼',
    tagline: '무엇을 하느냐만큼 어디서 하느냐가 중요합니다.',
    descriptions: [
      '메뉴보다 조명과 음악을 먼저 봅니다.',
      '새로 생긴 공간 소식에 누구보다 빠릅니다.',
      '시끄러운 곳보다 분위기 좋은 곳에서 오래 머뭅니다.',
    ],
  },
  routine_lover: {
    name: '루틴 애호가',
    tagline: '내가 좋아하는 방식에는 이유가 있습니다.',
    descriptions: [
      '늘 가던 곳, 늘 하던 순서가 가장 편합니다.',
      '일정이 갑자기 바뀌면 하루가 흐트러진 기분이 듭니다.',
      '좋아하는 것을 반복하는 데서 안정감을 얻습니다.',
    ],
  },
  balance_player: {
    name: '밸런스 플레이어',
    tagline: '어디에 데려다 놔도 제법 잘 놉니다.',
    descriptions: [
      '어느 쪽으로도 크게 치우치지 않아 누구와도 잘 맞춥니다.',
      '계획이 있어도 좋고 없어도 괜찮습니다.',
      '상황에 따라 취향을 바꿔 쓰는 편입니다.',
    ],
  },
};

// 2축 조합 Insight. 앞의 3개는 스펙 §10 예시 그대로다.
// TODO: 확정 필요 — 임시값 (나머지 문장과 임계값 전체)
export const COMBO_RULES: InsightRule[] = [
  { id: 'combo_novelty_structure', when: [{ axis: 'novelty', op: '>', value: 75 }, { axis: 'structure', op: '>', value: 70 }],
    text: '새로운 걸 좋아하지만 실패 확률은 줄이고 싶어합니다.' },
  { id: 'combo_spend_independence', when: [{ axis: 'spend', op: '>', value: 75 }, { axis: 'independence', op: '>', value: 55 }],
    text: '남들이 뭐라 하든 내가 좋아하는 경험에는 돈을 아끼지 않습니다.' },
  { id: 'combo_novelty_spontaneous', when: [{ axis: 'novelty', op: '>', value: 70 }, { axis: 'structure', op: '<', value: 35 }],
    text: '여행지를 정하는 순간보다 여행지에서 생기는 일이 더 중요합니다.' },
  { id: 'combo_social_spontaneous', when: [{ axis: 'social', op: '>', value: 70 }, { axis: 'structure', op: '<', value: 40 }],
    text: '약속은 미리 잡는 것보다 당일에 생기는 편이 많습니다.' },
  { id: 'combo_solo_novelty', when: [{ axis: 'social', op: '<', value: 35 }, { axis: 'novelty', op: '>', value: 65 }],
    text: '새로운 곳은 좋아하지만 혼자 조용히 둘러보는 걸 선호합니다.' },
  { id: 'combo_frugal_planner', when: [{ axis: 'spend', op: '<', value: 35 }, { axis: 'structure', op: '>', value: 65 }],
    text: '예산을 정해두고 그 안에서 최선을 찾는 데 능숙합니다.' },
  { id: 'combo_loud_social', when: [{ axis: 'stimulation', op: '>', value: 70 }, { axis: 'social', op: '>', value: 65 }],
    text: '사람 많고 시끌벅적한 자리에서 에너지를 얻습니다.' },
  { id: 'combo_calm_familiar', when: [{ axis: 'stimulation', op: '<', value: 35 }, { axis: 'novelty', op: '<', value: 40 }],
    text: '익숙하고 편안한 곳에서 보내는 시간이 최고의 휴식입니다.' },
  { id: 'combo_independent_solo', when: [{ axis: 'independence', op: '>', value: 70 }, { axis: 'social', op: '<', value: 40 }],
    text: '혼자만의 시간이 방해받지 않을 때 가장 잘 쉽니다.' },
  { id: 'combo_sharing_social', when: [{ axis: 'independence', op: '<', value: 35 }, { axis: 'social', op: '>', value: 60 }],
    text: '무엇을 하느냐보다 누구와 함께하느냐가 만족도를 정합니다.' },
  { id: 'combo_quiet_premium', when: [{ axis: 'spend', op: '>', value: 70 }, { axis: 'stimulation', op: '<', value: 40 }],
    text: '북적이는 곳보다 조용하고 좋은 공간에 돈을 씁니다.' },
  { id: 'combo_calm_planner', when: [{ axis: 'structure', op: '>', value: 70 }, { axis: 'stimulation', op: '<', value: 40 }],
    text: '예측 가능한 하루가 주는 편안함을 좋아합니다.' },
];

// 극단점수 Insight. 축마다 양쪽 끝 하나씩.
// TODO: 확정 필요 — 임시값
export const EXTREME_RULES: InsightRule[] = [
  { id: 'extreme_novelty_high', when: [{ axis: 'novelty', op: '>', value: 80 }], text: '가본 곳보다 안 가본 곳이 늘 더 궁금합니다.' },
  { id: 'extreme_novelty_low', when: [{ axis: 'novelty', op: '<', value: 20 }], text: '좋았던 곳을 다시 찾는 데서 확실한 만족을 얻습니다.' },
  { id: 'extreme_structure_high', when: [{ axis: 'structure', op: '>', value: 80 }], text: '계획이 서야 마음 놓고 즐길 수 있습니다.' },
  { id: 'extreme_structure_low', when: [{ axis: 'structure', op: '<', value: 20 }], text: '계획은 세우는 순간부터 답답해집니다.' },
  { id: 'extreme_social_high', when: [{ axis: 'social', op: '>', value: 80 }], text: '사람을 만나야 비로소 쉰 것 같습니다.' },
  { id: 'extreme_social_low', when: [{ axis: 'social', op: '<', value: 20 }], text: '혼자 있는 시간이 가장 확실한 충전입니다.' },
  { id: 'extreme_spend_high', when: [{ axis: 'spend', op: '>', value: 80 }], text: '좋은 경험이라면 가격은 두 번째 문제입니다.' },
  { id: 'extreme_spend_low', when: [{ axis: 'spend', op: '<', value: 20 }], text: '같은 값이면 더 알뜰한 쪽을 고르는 데 자부심이 있습니다.' },
  { id: 'extreme_stimulation_high', when: [{ axis: 'stimulation', op: '>', value: 80 }], text: '조용한 하루보다 꽉 찬 하루가 좋습니다.' },
  { id: 'extreme_stimulation_low', when: [{ axis: 'stimulation', op: '<', value: 20 }], text: '자극적인 것보다 편안한 것이 오래 갑니다.' },
  { id: 'extreme_independence_high', when: [{ axis: 'independence', op: '>', value: 80 }], text: '취향만큼은 누구에게도 양보하지 않습니다.' },
  { id: 'extreme_independence_low', when: [{ axis: 'independence', op: '<', value: 20 }], text: '내 취향보다 함께 즐거운 쪽을 고릅니다.' },
];

// 모순조합(내 안의 이상한 조합) Insight
// TODO: 확정 필요 — 임시값
export const PARADOX_RULES: InsightRule[] = [
  { id: 'paradox_new_but_calm', when: [{ axis: 'novelty', op: '>', value: 65 }, { axis: 'stimulation', op: '<', value: 35 }],
    text: '새로운 건 좋아하는데, 시끄러운 건 싫어합니다.' },
  { id: 'paradox_social_but_stubborn', when: [{ axis: 'social', op: '>', value: 65 }, { axis: 'independence', op: '>', value: 65 }],
    text: '사람은 좋아하지만 취향은 절대 안 맞춰줍니다.' },
  { id: 'paradox_planned_allnighter', when: [{ axis: 'structure', op: '>', value: 65 }, { axis: 'stimulation', op: '>', value: 65 }],
    text: '계획은 철저한데 그 계획이 밤새 노는 일정입니다.' },
  { id: 'paradox_spender_no_booking', when: [{ axis: 'spend', op: '>', value: 65 }, { axis: 'structure', op: '<', value: 35 }],
    text: '돈은 과감하게 쓰는데 예약은 안 합니다.' },
  { id: 'paradox_curious_but_frugal', when: [{ axis: 'spend', op: '<', value: 35 }, { axis: 'novelty', op: '>', value: 65 }],
    text: '새로운 건 다 해보고 싶은데 지갑은 신중합니다.' },
  { id: 'paradox_solo_but_intense', when: [{ axis: 'social', op: '<', value: 35 }, { axis: 'stimulation', op: '>', value: 65 }],
    text: '사람 많은 건 싫은데 자극적인 건 좋아합니다.' },
  { id: 'paradox_solo_but_accommodating', when: [{ axis: 'independence', op: '<', value: 35 }, { axis: 'social', op: '<', value: 35 }],
    text: '혼자가 편한데, 막상 함께하면 다 맞춰줍니다.' },
  { id: 'paradox_familiar_but_pricey', when: [{ axis: 'novelty', op: '<', value: 35 }, { axis: 'spend', op: '>', value: 65 }],
    text: '늘 가던 곳만 가는데 그곳이 꽤 비쌉니다.' },
  { id: 'paradox_no_plan_same_place', when: [{ axis: 'structure', op: '<', value: 35 }, { axis: 'novelty', op: '<', value: 35 }],
    text: '계획은 안 세우는데 결국 늘 가던 곳으로 갑니다.' },
];
