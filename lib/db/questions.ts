// 서버 전용. 채점에 쓸 문항 메타를 questions 테이블에서 읽는다.
import type { QuestionMeta } from '../scoring/v1/axes.ts';
import { AXES, type Axis } from '../scoring/v1/prototypes.ts';
import type { TestQuestion } from '../quiz/types.ts';
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

// 테스트 화면에 내려보내는 문항. axis·scoring_key는 포함하지 않는다(채점 기준을 브라우저에 주지 않는다).
// 순서는 모든 사용자에게 같다. sort_seed가 있으면 그 순서, 없으면 code 해시 순서로 카테고리를 섞는다.
export async function loadTestQuestions(version: number = TEST_VERSION): Promise<TestQuestion[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, text, response_type, option_a, option_b, option_c, option_d
    FROM ${table('questions')}
    WHERE is_active = true AND version = ${version}
    ORDER BY sort_seed NULLS LAST, md5(code)
  `;
  return rows.map(r => ({
    id: r.id as string,
    text: r.text as string,
    options: (['a', 'b', 'c', 'd'] as const)
      .map(key => ({ key, label: r[`option_${key}`] as string | null }))
      .filter((o): o is { key: 'a' | 'b' | 'c' | 'd'; label: string } => o.label !== null),
  }));
}
