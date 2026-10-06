// responses(원본)로 profiles의 캐시(6축 점수, main_type_id, subtype_id)를 전부 다시 계산한다. 스펙 §18.3
// 프로필마다 최신 회차(attempt_no 최댓값)의 응답만 쓴다.
// 실행: npm run db:recompute            (갱신)
//       npm run db:recompute -- --dry   (타입 분포만 출력)
import { getSql, table } from '../lib/db/client.ts';
import { loadQuestions } from '../lib/db/questions.ts';
import { scoreProfile, type ResponseItem, type TypeId } from '../lib/scoring/v1/index.ts';

const CHUNK = 100;
const dry = process.argv.includes('--dry');

const sql = getSql();
const profiles = table('profiles');
const responses = table('responses');

const questions = await loadQuestions();
if (questions.length === 0) throw new Error('활성 문항이 없습니다. npm run db:seed를 먼저 실행하세요.');

const rows = await sql`
  SELECT r.profile_id, r.question_id, r.answer
  FROM ${responses} r
  JOIN (
    SELECT profile_id, max(attempt_no) AS attempt_no FROM ${responses} GROUP BY profile_id
  ) latest ON latest.profile_id = r.profile_id AND latest.attempt_no = r.attempt_no
`;

const byProfile = new Map<string, ResponseItem[]>();
for (const r of rows) {
  const list = byProfile.get(r.profile_id) ?? [];
  list.push({ questionId: r.question_id, answer: r.answer });
  byProfile.set(r.profile_id, list);
}

const scored = [...byProfile].map(([id, items]) => ({ id, ...scoreProfile(items, questions) }));

if (!dry) {
  for (let i = 0; i < scored.length; i += CHUNK) {
    await sql.transaction(scored.slice(i, i + CHUNK).map(s => sql`
      UPDATE ${profiles} SET
        main_type_id = ${s.typeId}, subtype_id = ${s.subtypeId},
        novelty_score = ${s.axes.novelty}, structure_score = ${s.axes.structure},
        social_score = ${s.axes.social}, spend_score = ${s.axes.spend},
        stimulation_score = ${s.axes.stimulation}, independence_score = ${s.axes.independence},
        updated_at = now()
      WHERE id = ${s.id}
    `));
  }
}

const counts = new Map<TypeId, number>();
for (const s of scored) counts.set(s.typeId, (counts.get(s.typeId) ?? 0) + 1);

console.log(`${dry ? '(dry) ' : ''}프로필 ${scored.length}개 재채점 (문항 ${questions.length}개 기준)`);
for (const [typeId, n] of [...counts].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${typeId.padEnd(22)}${String(n).padStart(6)}`);
}
