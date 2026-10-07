// 6축의 좌·우 Pole 라벨(스펙 §3.1). 화면에 보이는 순서이기도 하다.
// 채점 코드(lib/scoring/v1)의 값을 가져오지 않는다. 브라우저 번들에 들어가는 파일이다.
import type { Axis } from '../scoring/v1/prototypes.ts';

export const AXIS_LABELS: { axis: Axis; left: string; right: string }[] = [
  { axis: 'novelty', left: '익숙함', right: '새로움' },
  { axis: 'structure', left: '즉흥', right: '계획' },
  { axis: 'social', left: '혼자·소수', right: '함께·다수' },
  { axis: 'spend', left: '실용·절약', right: '경험·프리미엄' },
  { axis: 'stimulation', left: '편안함', right: '강한 자극' },
  { axis: 'independence', left: '공유', right: '독립' },
];
