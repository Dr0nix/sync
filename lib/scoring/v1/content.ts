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

// name·tagline은 스펙 §3.4 그대로다. descriptions는 사용자가 쓴 문구다(강점, 아쉬운 점, 같이 있을 때의 모습 순).
// descriptions는 타입 소개 페이지의 "이 타입의 특징"과, 결과 화면에서 맞는 Insight가 모자랄 때 채우는 문장으로 함께 쓰인다.
export const TYPE_CONTENT: Record<TypeId, TypeContent> = {
  planned_hedonist: {
    name: '계획형 쾌락주의자',
    tagline: '놀기 위해 계획합니다.',
    descriptions: [
      '한정된 시간과 돈으로 만족을 최대로 끌어내는 데 능합니다.',
      '계획이 틀어지면 남들보다 조금 더 오래 아쉬워합니다.',
      '같이 놀면 "다음엔 뭐 하지?"를 고민할 필요가 없습니다.',
    ],
  },
  spontaneous_explorer: {
    name: '즉흥 탐험가',
    tagline: '일단 가면 뭔가 생깁니다.',
    descriptions: [
      '예상 못 한 상황에서 오히려 실력이 나옵니다.',
      '시작은 빠르지만 마무리는 남에게 맡길 때가 있습니다.',
      '같이 있으면 평범한 날도 에피소드가 하나쯤 생깁니다.',
    ],
  },
  taste_curator: {
    name: '취향 큐레이터',
    tagline: '아무거나 좋다는 말이 제일 어렵습니다.',
    descriptions: [
      '좋은 것을 알아보는 눈이 있어서 주변 사람들의 단골 추천인이 됩니다.',
      '쉽게 "괜찮다"고 말하지 않아서 까다롭다는 말을 듣기도 합니다.',
      '이 사람이 좋다고 하면 일단 믿고 따라가도 됩니다.',
    ],
  },
  premium_experiencer: {
    name: '프리미엄 경험파',
    tagline: '남는 건 결국 경험이라고 생각합니다.',
    descriptions: [
      '쓴 만큼의 즐거움을 확실히 챙겨 오는 사람입니다.',
      '통장 잔고보다 추억이 먼저 쌓일 때가 있습니다.',
      '같이 가면 "이런 데도 있었어?" 싶은 곳에 가게 됩니다.',
    ],
  },
  pragmatic_realist: {
    name: '가성비 현실파',
    tagline: '좋은 선택보다 납득되는 선택.',
    descriptions: [
      '같은 예산으로 남들보다 더 많은 걸 해내는 사람입니다.',
      '가끔은 "그냥 좀 쓰자"는 말을 듣습니다.',
      '모임 정산과 예산 관리는 이 사람에게 맡기면 안심입니다.',
    ],
  },
  comfort_first: {
    name: '안락제일주의자',
    tagline: '좋았던 데는 이유가 있습니다.',
    descriptions: [
      '함께 있으면 마음이 편해지는 안정감을 줍니다.',
      '새로운 제안 앞에서는 "다음에"가 먼저 나올 때가 있습니다.',
      '지친 친구가 쉬고 싶을 때 제일 먼저 생각나는 사람입니다.',
    ],
  },
  weekend_wanderer: {
    name: '주말 방랑자',
    tagline: '집을 나서면 계획이 생깁니다.',
    descriptions: [
      '어디서든 금방 분위기를 띄우는 행동력이 있습니다.',
      '바쁜 주말을 보내고 나서야 피곤하다는 걸 깨닫기도 합니다.',
      '심심하다는 친구를 그냥 두지 않습니다.',
    ],
  },
  people_are_content: {
    name: '사람이 콘텐츠',
    tagline: '어디보다 누구랑이 중요합니다.',
    descriptions: [
      '상대가 무슨 말을 듣고 싶은지 금방 알아챕니다.',
      '내 취향이 뭔지 잠깐 헷갈릴 때가 있습니다.',
      '함께하는 자리를 조금 더 따뜻하게 만듭니다.',
    ],
  },
  solo_deepdiver: {
    name: '혼놀 딥다이버',
    tagline: '혼자여도 심심할 틈이 없습니다.',
    descriptions: [
      '혼자 있는 시간을 누구보다 알차게 쓸 줄 압니다.',
      '연락이 뜸해서 서운하다는 말을 듣기도 합니다.',
      '오래 알수록 깊은 이야기를 나눌 수 있는 친구입니다.',
    ],
  },
  mood_hunter: {
    name: '분위기 사냥꾼',
    tagline: '무엇을 하느냐만큼 어디서 하느냐가 중요합니다.',
    descriptions: [
      '평범한 하루도 영화의 한 장면처럼 만드는 감각이 있습니다.',
      '마음에 드는 곳을 찾기까지 시간이 좀 걸립니다.',
      '이 사람이 고른 약속 장소는 대체로 실패가 없습니다.',
    ],
  },
  routine_lover: {
    name: '루틴 애호가',
    tagline: '내가 좋아하는 방식에는 이유가 있습니다.',
    descriptions: [
      '꾸준함으로 남들이 따라오기 힘든 결과를 만들어 냅니다.',
      '갑작스러운 제안에는 대답이 조금 늦어집니다.',
      '약속을 잡으면 가장 믿을 수 있는 사람입니다.',
    ],
  },
  balance_player: {
    name: '밸런스 플레이어',
    tagline: '어디에 데려다 놔도 제법 잘 놉니다.',
    descriptions: [
      '어떤 상황에서도 크게 흔들리지 않는 침착함이 있습니다.',
      '확실한 취향을 물으면 대답이 길어집니다.',
      '새로운 걸 같이 해보자고 하면 대부분 흔쾌히 따라옵니다.',
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
