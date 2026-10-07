import { AXES, type Axes, type Axis } from './prototypes.ts';

// questions 테이블에서 채점에 필요한 컬럼만 추린 형태
export type QuestionMeta = {
  id: string;
  category: string;
  axis: Axis;
  scoringKey: Record<string, number>;
};

// 한 회차(attempt)의 응답. 여러 회차를 섞어서 넘기지 않는다.
export type ResponseItem = {
  questionId: string;
  answer: string;
};

const NEUTRAL = 50;

// 축별 점수 = 그 축 문항들의 기여값 평균 → 0~100 반올림 (스펙 §3.2)
// 문항 목록에 없는 응답, scoring_key에 없는 선택지는 집계에서 뺀다. 응답이 하나도 없는 축은 중립(50)이다.
export function computeAxes(responses: ResponseItem[], questions: QuestionMeta[]): Axes {
  const byId = new Map(questions.map(q => [q.id, q]));
  const sum = Object.fromEntries(AXES.map(k => [k, 0])) as Axes;
  const count = Object.fromEntries(AXES.map(k => [k, 0])) as Axes;

  for (const r of responses) {
    const q = byId.get(r.questionId);
    const value = q?.scoringKey[r.answer];
    if (!q || value === undefined) continue;
    sum[q.axis] += value;
    count[q.axis]++;
  }

  const axes = {} as Axes;
  for (const k of AXES) {
    axes[k] = count[k] === 0 ? NEUTRAL : Math.round(sum[k] / count[k]);
  }
  return axes;
}
