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

// 스펙 §4 등급명 그대로. 점수가 min 이상인 첫 등급을 쓴다(높은 등급부터).
export const SYNC_GRADES: SyncGrade[] = [
  { min: 95, name: 'CTRL+C CTRL+V', copy: '이 정도면 한 사람이 두 계정 쓰는 수준.' },
  { min: 90, name: '취향 쌍둥이', copy: '고를 때마다 서로 쳐다볼 가능성 높음.' },
  { min: 80, name: '찐친 정배', copy: '같이 놀면 웬만하면 실패하지 않음.' },
  { min: 70, name: '제법 잘 맞음', copy: '다르긴 한데 그게 문제될 정도는 아님.' },
  { min: 60, name: '다름을 즐기는 사이', copy: '취향보다 사람이 좋아서 친구인 듯.' },
  { min: 50, name: '우리가 왜 친하지?', copy: '데이터로는 설명이 잘 안 됩니다.' },
  { min: 30, name: '기적의 우정', copy: '취향은 싸우는데 우정은 살아남음.' },
  { min: 0, name: '상극 생존자', copy: '서로의 선택을 이해하려 하지 마세요.' },
];
