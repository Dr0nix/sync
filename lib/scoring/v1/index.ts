// 채점 진입점. 서버(Route Handler, scripts/)에서만 쓴다. 브라우저 번들에 들어가면 안 된다(스펙 §6.1).
import { computeAxes, type QuestionMeta, type ResponseItem } from './axes.ts';
import { selectInsights } from './insights.ts';
import type { Axes, TypeId } from './prototypes.ts';
import { resolveType } from './resolve-type.ts';

// matches.scoring_version에 저장하는 값. 산식을 바꾸면 v1을 고치지 말고 v2/를 새로 만든다.
export const SCORING_VERSION = 1;

export type ProfileScore = {
  axes: Axes;
  typeId: TypeId;
  subtypeId: TypeId | null;
  insights: string[];
  paradoxes: string[];
};

// responses는 한 회차의 응답만 넘긴다.
export function scoreProfile(responses: ResponseItem[], questions: QuestionMeta[]): ProfileScore {
  const axes = computeAxes(responses, questions);
  const { typeId, subtypeId } = resolveType(axes);
  return { axes, typeId, subtypeId, ...selectInsights(axes, typeId) };
}

export type { QuestionMeta, ResponseItem } from './axes.ts';
export type { Axes, Axis, TypeId } from './prototypes.ts';

export { computeSync, type SyncResult } from './sync.ts';
export { gradeFor } from './sync-grade.ts';
export type { MatchedItem, MismatchedItem } from './sync-items.ts';
export { selectSituations } from './sync-situations.ts';
