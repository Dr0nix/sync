// db/seed/questions.v1.json(문항 원문) + lib/scoring/v1/question-keys.ts(축 매핑)를 questions 테이블에 넣는다.
// code 기준 upsert라 여러 번 실행해도 된다. 기존 문항의 id는 바뀌지 않는다.
// 실행: npm run db:seed
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getSql, table } from '../lib/db/client.ts';
import { TEST_VERSION } from '../lib/db/questions.ts';
import { QUESTION_KEYS } from '../lib/scoring/v1/question-keys.ts';

type SeedQuestion = {
  code: string;
  category: string;
  response_type: 'binary' | 'quad';
  text: string;
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
};

const FILE = join(import.meta.dirname, '..', 'db', 'seed', `questions.v${TEST_VERSION}.json`);
const seed: SeedQuestion[] = JSON.parse(readFileSync(FILE, 'utf8'));

const missing = seed.filter(q => !QUESTION_KEYS[q.code]).map(q => q.code);
if (missing.length > 0) throw new Error(`축 매핑이 없는 문항: ${missing.join(', ')}`);

const sql = getSql();
const questions = table('questions');

await sql.transaction(seed.map(q => {
  const { axis, scoringKey } = QUESTION_KEYS[q.code];
  return sql`
    INSERT INTO ${questions}
      (id, code, text, category, response_type, option_a, option_b, option_c, option_d, axis, scoring_key, version)
    VALUES
      (${randomUUID()}, ${q.code}, ${q.text}, ${q.category}, ${q.response_type},
       ${q.option_a}, ${q.option_b}, ${q.option_c ?? null}, ${q.option_d ?? null},
       ${axis}, ${JSON.stringify(scoringKey)}::jsonb, ${TEST_VERSION})
    ON CONFLICT (code) DO UPDATE SET
      text = EXCLUDED.text, category = EXCLUDED.category, response_type = EXCLUDED.response_type,
      option_a = EXCLUDED.option_a, option_b = EXCLUDED.option_b,
      option_c = EXCLUDED.option_c, option_d = EXCLUDED.option_d,
      axis = EXCLUDED.axis, scoring_key = EXCLUDED.scoring_key, version = EXCLUDED.version
  `;
}));

const [{ n }] = await sql`SELECT count(*)::int AS n FROM ${questions} WHERE version = ${TEST_VERSION}`;
console.log(`questions v${TEST_VERSION}: seed ${seed.length}개 반영, 테이블에 ${n}개`);
