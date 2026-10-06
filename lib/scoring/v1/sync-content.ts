// FRIEND SYNC 결과에 나가는 문구 데이터.

// questions.category 값과 화면 표시 이름. 영역별 비교 바의 순서이기도 하다(스펙 §9).
export const CATEGORIES = ['food', 'travel', 'leisure', 'spend', 'life', 'social'] as const;
export type Category = typeof CATEGORIES[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  food: '음식',
  travel: '여행',
  leisure: '놀기',
  spend: '소비',
  life: '생활',
  social: '관계',
};

export type SyncGrade = { min: number; name: string; copy: string };

// 등급명과 카피는 스펙 §4 그대로. 점수가 min 이상인 첫 등급을 쓴다(높은 등급부터).
// TODO: 확정 필요 — 임시값 (경계값)
// 2지선다라 모르는 사람끼리도 약 50점, 같은 사람의 재응시도 100점이 안 나온다. 응답 모델 시뮬레이션의 친구 쌍 분위수로 잡은 값이다.
// 베타 후 matches.sync_score 분포와 재응시(attempt_no 1 vs 2) 자기 일치율로 다시 잡는다.
export const SYNC_GRADES: SyncGrade[] = [
  { min: 85, name: 'CTRL+C CTRL+V', copy: '이 정도면 한 사람이 두 계정 쓰는 수준.' },
  { min: 78, name: '취향 쌍둥이', copy: '고를 때마다 서로 쳐다볼 가능성 높음.' },
  { min: 70, name: '찐친 정배', copy: '같이 놀면 웬만하면 실패하지 않음.' },
  { min: 62, name: '제법 잘 맞음', copy: '다르긴 한데 그게 문제될 정도는 아님.' },
  { min: 55, name: '다름을 즐기는 사이', copy: '취향보다 사람이 좋아서 친구인 듯.' },
  { min: 48, name: '우리가 왜 친하지?', copy: '데이터로는 설명이 잘 안 됩니다.' },
  { min: 40, name: '기적의 우정', copy: '취향은 싸우는데 우정은 살아남음.' },
  { min: 0, name: '상극 생존자', copy: '서로의 선택을 이해하려 하지 마세요.' },
];

// 영역별 일치율로 고르는 "둘이 잘 맞는 상황 / 의견 갈릴 상황" 문장.
// TODO: 확정 필요 — 임시값 (문장과 임계값 전체)
export const GOOD_MIN = 70;    // 이 점수 이상인 영역만 "잘 맞는 상황" 후보
export const CLASH_MAX = 50;   // 이 점수 이하인 영역만 "의견 갈릴 상황" 후보

export const SITUATIONS: Record<Category, { good: string; clash: string }> = {
  food: {
    good: '메뉴 고를 때 둘이 싸울 일이 거의 없습니다.',
    clash: '저녁 메뉴를 정하는 데 시간이 좀 걸립니다.',
  },
  travel: {
    good: '같이 여행 가도 일정으로 부딪힐 일이 적습니다.',
    clash: '여행 스타일은 출발 전에 맞춰두는 게 좋습니다.',
  },
  leisure: {
    good: '주말에 뭐 할지 금방 정해집니다.',
    clash: '한 명은 나가고 싶고 한 명은 쉬고 싶을 수 있습니다.',
  },
  spend: {
    good: '돈 쓰는 기준이 비슷해서 계산이 편합니다.',
    clash: '어디에 얼마를 쓸지는 미리 얘기해 두세요.',
  },
  life: {
    good: '생활 리듬이 비슷해서 같이 있어도 편합니다.',
    clash: '하루를 보내는 방식이 꽤 다릅니다.',
  },
  social: {
    good: '사람을 대하는 방식이 닮았습니다.',
    clash: '모임을 대하는 온도가 서로 다릅니다.',
  },
};
