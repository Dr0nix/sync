// 공통점·차이점으로 보여줄 문항 고르기.
// 원본 응답 전체를 저장하거나 내려보내지 않기 위해 일부만 추린다(스펙 §12).
import { CATEGORIES } from './sync-content.ts';

export const MAX_ITEMS = 5;

// 문항 원문과 선택지 문구는 넣지 않는다. 화면에 보여줄 때 questions에서 붙인다.
export type MatchedItem = { questionId: string; answer: string };
export type MismatchedItem = { questionId: string; a: string; b: string };

// FNV-1a 32비트
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// 카테고리를 돌아가며 하나씩 뽑아 한 영역에 몰리지 않게 한다.
// 카테고리 안에서의 순서는 seed로 정한다. 매치마다 seed가 달라 늘 같은 문항만 나오지 않는다.
export function pickSpread<T extends { questionId: string; category: string }>(
  candidates: T[], seed: string, max: number = MAX_ITEMS,
): T[] {
  const groups = new Map<string, T[]>();
  for (const c of candidates) groups.set(c.category, [...(groups.get(c.category) ?? []), c]);

  const rank = (c: T) => hash(`${seed}:${c.questionId}`);
  for (const list of groups.values()) {
    list.sort((x, y) => rank(x) - rank(y) || x.questionId.localeCompare(y.questionId));
  }

  const known: readonly string[] = CATEGORIES;
  const order = [
    ...known.filter(c => groups.has(c)),
    ...[...groups.keys()].filter(c => !known.includes(c)).sort(),
  ];

  const picked: T[] = [];
  for (let round = 0; picked.length < max; round++) {
    const before = picked.length;
    for (const category of order) {
      const item = groups.get(category)![round];
      if (item && picked.length < max) picked.push(item);
    }
    if (picked.length === before) break;
  }
  return picked;
}
