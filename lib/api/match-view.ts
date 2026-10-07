// 저장된 매치를 응답 형태로 조립한다. 서버 전용 순수 함수.
// 누가 보느냐에 따라 내려보내는 범위가 달라진다(스펙 §12).
import { TYPE_CONTENT } from '../scoring/v1/content.ts';
import type { TypeId } from '../scoring/v1/prototypes.ts';
import { CATEGORIES, CATEGORY_LABELS } from '../scoring/v1/sync-content.ts';
import { gradeFor } from '../scoring/v1/sync-grade.ts';
import type { MatchedItem, MismatchedItem } from '../scoring/v1/sync-items.ts';
import { selectSituations } from '../scoring/v1/sync-situations.ts';
import type { MatchDetail, MatchResult } from './match-result.ts';

export type StoredMatch = {
  id: string;
  score: number;
  categoryScores: Record<string, number>;
  matched: MatchedItem[];
  mismatched: MismatchedItem[];
  a: MatchSide;
  b: MatchSide;
};

export type MatchSide = { nickname: string; typeId: TypeId | null };

// 문항 id → 문구와 선택지 문구
export type QuestionTexts = Map<string, { text: string; options: Record<string, string> }>;

export type Viewer = 'a' | 'b' | null;

const typeOf = (side: MatchSide) =>
  side.typeId ? { id: side.typeId, name: TYPE_CONTENT[side.typeId].name } : null;

export function buildMatchResult(match: StoredMatch, texts: QuestionTexts, viewer: Viewer): MatchResult {
  const grade = gradeFor(match.score);
  // 당사자는 자기가 앞에 오게 본다.
  const [me, friend] = viewer === 'b' ? [match.b, match.a] : [match.a, match.b];

  const base = {
    matchId: match.id,
    score: match.score,
    grade: { name: grade.name, copy: grade.copy },
    me: { nickname: me.nickname },
    friend: { nickname: friend.nickname },
  };
  if (viewer === null) return { ...base, detail: null };

  // 문항이 없어졌거나 선택지 문구를 찾지 못한 항목은 뺀다.
  const matched: MatchDetail['matched'] = [];
  for (const item of match.matched) {
    const q = texts.get(item.questionId);
    const answer = q?.options[item.answer];
    if (q && answer) matched.push({ question: q.text, answer });
  }

  const mismatched: MatchDetail['mismatched'] = [];
  for (const item of match.mismatched) {
    const q = texts.get(item.questionId);
    const [mine, theirs] = viewer === 'b' ? [item.b, item.a] : [item.a, item.b];
    const meLabel = q?.options[mine], friendLabel = q?.options[theirs];
    if (q && meLabel && friendLabel) mismatched.push({ question: q.text, me: meLabel, friend: friendLabel });
  }

  return {
    ...base,
    detail: {
      me: { type: typeOf(me) },
      friend: { type: typeOf(friend) },
      categories: CATEGORIES
        .filter(c => match.categoryScores[c] !== undefined)
        .map(c => ({ id: c, label: CATEGORY_LABELS[c], score: match.categoryScores[c] })),
      matched,
      mismatched,
      ...selectSituations(match.categoryScores),
    },
  };
}
