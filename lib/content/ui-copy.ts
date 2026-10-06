// 화면 문구 데이터. 브라우저 번들에 들어가는 파일이다.

// TODO: 확정 필요 — 임시값
// 10문항마다 나오는 인터미션 카드. 순서대로 10, 20, 30, 40, 50문항 뒤에 쓴다.
export const INTERMISSIONS: { title: string; body: string }[] = [
  { title: '좋은 출발이에요', body: '벌써 10문항. 고민하지 말고 끌리는 쪽을 고르면 돼요.' },
  { title: '3분의 1 지났어요', body: '슬슬 취향의 윤곽이 보이기 시작합니다.' },
  { title: '딱 절반', body: '여기까지 왔으면 끝까지 가는 타입이네요.' },
  { title: '20문항 남았어요', body: '조금만 더. 결과가 꽤 그럴듯해지고 있어요.' },
  { title: '마지막 10문항', body: '거의 다 왔어요. 끝나면 바로 타입을 알려드릴게요.' },
];

// TODO: 확정 필요 — 임시값 (성별·연령대 선택지의 표시 이름. 값은 lib/api/submit-input.ts)
export const GENDER_LABELS: Record<string, string> = { male: '남성', female: '여성', other: '기타' };
export const AGE_BAND_LABELS: Record<string, string> = {
  '10s': '10대', '20s': '20대', '30s': '30대', '40s_plus': '40대 이상',
};

// TODO: 확정 필요 — 임시값 (공유할 때 링크와 함께 나가는 문구)
export const SHARE_COPY = {
  invite: (typeName: string) => `내 취향 타입은 ${typeName}. 너는 뭐 나와?`,
  match: (me: string, friend: string, score: number, gradeName: string) =>
    `${me} × ${friend} SYNC ${score}% · ${gradeName}`,
};

// 초대 링크를 메신저에 붙였을 때 미리보기에 나오는 문구
// TODO: 확정 필요 — 임시값
export const INVITE_PREVIEW = {
  title: (nickname: string) => `${nickname}님이 나랑 취향이 얼마나 겹치는지 궁금해해요`,
  description: '생일도 별자리도 필요 없어요. 둘이 직접 고른 답으로 비교해요.',
};
