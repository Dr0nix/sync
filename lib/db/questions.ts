// 서버 전용. 채점에 쓸 문항 메타를 questions 테이블에서 읽는다.
import type { QuestionMeta } from '../scoring/v1/axes.ts';
import { AXES, type Axis } from '../scoring/v1/prototypes.ts';
import { getSql, table } from './client.ts';

// questions.version / responses.test_version에 저장하는 값
export const TEST_VERSION = 1;

export async function loadQuestions(version: number = TEST_VERSION): Promise<QuestionMeta[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, code, category, axis, scoring_key
    FROM ${table('questions')}
    WHERE is_active = true AND version = ${version}
  `;
  return rows.map(r => {
    if (!AXES.includes(r.axis as Axis)) throw new Error(`문항 ${r.code}의 axis가 올바르지 않습니다: ${r.axis}`);
    return {
      id: r.id as string,
      category: r.category as string,
      axis: r.axis as Axis,
      scoringKey: r.scoring_key as Record<string, number>,
    };
  });
}
