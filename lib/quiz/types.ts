// 브라우저로 내려가는 문항 형태. 문구와 선택지만 있고 채점 정보는 없다.
export type TestQuestion = {
  id: string;
  text: string;
  options: { key: string; label: string }[];
};
