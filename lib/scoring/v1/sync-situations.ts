import { CATEGORIES, CLASH_MAX, GOOD_MIN, SITUATIONS, type Category } from './sync-content.ts';

export const MAX_SITUATIONS = 2;

// 일치율이 높은 영역에서 "잘 맞는 상황"을, 낮은 영역에서 "의견 갈릴 상황"을 고른다.
// 임계값을 넘는 영역이 없으면 그쪽은 비어 있다. 점수가 같으면 CATEGORIES 순서를 따른다.
export function selectSituations(categoryScores: Record<string, number>): { goodAt: string[]; clashAt: string[] } {
  const scored = CATEGORIES
    .filter(c => categoryScores[c] !== undefined)
    .map(c => ({ category: c as Category, score: categoryScores[c] }));

  const goodAt = scored
    .filter(s => s.score >= GOOD_MIN)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SITUATIONS)
    .map(s => SITUATIONS[s.category].good);

  const clashAt = scored
    .filter(s => s.score <= CLASH_MAX)
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_SITUATIONS)
    .map(s => SITUATIONS[s.category].clash);

  return { goodAt, clashAt };
}
