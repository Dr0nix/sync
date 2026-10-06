// FRIEND SYNC 산식 v0 (스펙 §4). 서버에서만 실행한다.
//   Raw Sync = (동일 응답 문항 수 / 두 사람이 모두 답한 비교가능 문항 수) × 100
import type { QuestionMeta, ResponseItem } from './axes.ts';

export type SyncResult = {
  score: number;                            // 0~100 정수
  comparable: number;                       // 두 사람이 모두 답한 문항 수
  categoryScores: Record<string, number>;   // 비교가능 문항이 있는 카테고리만 들어간다
};

const percent = (same: number, total: number) => (total === 0 ? 0 : Math.round((same / total) * 100));

// a, b는 각자 한 회차의 응답. questions에 없는 문항의 응답은 비교에서 뺀다.
// 2지선다·4지선다 모두 같은 선택지를 골랐는지만 본다.
export function computeSync(a: ResponseItem[], b: ResponseItem[], questions: QuestionMeta[]): SyncResult {
  const answersA = new Map(a.map(r => [r.questionId, r.answer]));
  const answersB = new Map(b.map(r => [r.questionId, r.answer]));

  let same = 0, comparable = 0;
  const byCategory = new Map<string, { same: number; total: number }>();

  for (const q of questions) {
    const x = answersA.get(q.id), y = answersB.get(q.id);
    if (x === undefined || y === undefined) continue;

    const tally = byCategory.get(q.category) ?? { same: 0, total: 0 };
    byCategory.set(q.category, tally);
    comparable++;
    tally.total++;
    if (x === y) {
      same++;
      tally.same++;
    }
  }

  return {
    score: percent(same, comparable),
    comparable,
    categoryScores: Object.fromEntries([...byCategory].map(([c, t]) => [c, percent(t.same, t.total)])),
  };
}
