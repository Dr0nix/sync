// FRIEND SYNC 산식 v0 (스펙 §4). 서버에서만 실행한다.
//   Raw Sync = (동일 응답 문항 수 / 두 사람이 모두 답한 비교가능 문항 수) × 100
import type { QuestionMeta, ResponseItem } from './axes.ts';
import { MAX_ITEMS, pickSpread, type MatchedItem, type MismatchedItem } from './sync-items.ts';

export const DISCLOSE_POOL = 12;   // 한 쌍 사이에서 공개될 수 있는 문항 수의 상한

export type SyncResult = {
  score: number;                            // 0~100 정수
  comparable: number;                       // 두 사람이 모두 답한 문항 수
  categoryScores: Record<string, number>;   // 비교가능 문항이 있는 카테고리만 들어간다
  matched: MatchedItem[];                   // 공통점으로 보여줄 일부
  mismatched: MismatchedItem[];             // 차이점으로 보여줄 일부. a·b는 인자 순서 그대로다
};

const percent = (same: number, total: number) => (total === 0 ? 0 : Math.round((same / total) * 100));

// a, b는 각자 한 회차의 응답. questions에 없는 문항의 응답은 비교에서 뺀다.
// 2지선다·4지선다 모두 같은 선택지를 골랐는지만 본다.
// seed는 두 사람을 가리키는 고정값이어야 한다. 같은 쌍이면 회차가 바뀌어도 같은 공개 풀이 나온다.
// 점수에는 영향이 없다.
export function computeSync(
  a: ResponseItem[], b: ResponseItem[], questions: QuestionMeta[], seed: string = '',
): SyncResult {
  const answersA = new Map(a.map(r => [r.questionId, r.answer]));
  const answersB = new Map(b.map(r => [r.questionId, r.answer]));

  let same = 0;
  const byCategory = new Map<string, { same: number; total: number }>();
  const answered: { questionId: string; category: string; a: string; b: string }[] = [];

  for (const q of questions) {
    const x = answersA.get(q.id), y = answersB.get(q.id);
    if (x === undefined || y === undefined) continue;

    const tally = byCategory.get(q.category) ?? { same: 0, total: 0 };
    byCategory.set(q.category, tally);
    tally.total++;
    if (x === y) {
      same++;
      tally.same++;
    }
    answered.push({ questionId: q.id, category: q.category, a: x, b: y });
  }

  // 공개 풀을 응답 내용과 무관하게 먼저 정하고, 공통점·차이점은 그 안에서만 고른다.
  // 재응시로 매치를 새로 만들어도 풀 밖 문항의 응답은 드러나지 않는다(스펙 §12).
  const pool = pickSpread(answered, seed, DISCLOSE_POOL);

  return {
    score: percent(same, answered.length),
    comparable: answered.length,
    categoryScores: Object.fromEntries([...byCategory].map(([c, t]) => [c, percent(t.same, t.total)])),
    matched: pool
      .filter(p => p.a === p.b)
      .slice(0, MAX_ITEMS)
      .map(p => ({ questionId: p.questionId, answer: p.a })),
    mismatched: pool
      .filter(p => p.a !== p.b)
      .slice(0, MAX_ITEMS)
      .map(p => ({ questionId: p.questionId, a: p.a, b: p.b })),
  };
}
