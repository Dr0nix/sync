// 서버 전용. 프로필과 응답을 저장하고 조회한다.
import { randomUUID } from 'node:crypto';
import { NeonDbError } from '@neondatabase/serverless';
import type { SubmitInput } from '../api/submit-input.ts';
import type { QuestionMeta } from '../scoring/v1/axes.ts';
import { scoreProfile } from '../scoring/v1/index.ts';
import type { Axes, TypeId } from '../scoring/v1/prototypes.ts';
import { getSql, table } from './client.ts';
import { TEST_VERSION } from './questions.ts';

const UNIQUE_VIOLATION = '23505';

export type SavedSubmission = { profileId: string; attemptNo: number };

// 응답 저장 → 채점 → profiles 캐시 갱신을 한 트랜잭션으로 처리한다.
// 같은 토큰의 프로필이 이미 있으면 새 프로필을 만들지 않고 다음 회차로 쌓는다.
// 같은 회차가 동시에 두 번 들어오면 responses 고유 제약에 걸리고, 이때 'conflict'를 돌려준다.
export async function saveSubmission(
  input: SubmitInput,
  questions: QuestionMeta[],
): Promise<SavedSubmission | 'conflict'> {
  const sql = getSql();
  const profiles = table('profiles');
  const responses = table('responses');

  const [existing] = await sql`
    SELECT p.id, (SELECT coalesce(max(r.attempt_no), 0) FROM ${responses} r WHERE r.profile_id = p.id) AS last_attempt
    FROM ${profiles} p
    WHERE p.anonymous_token = ${input.anonymousToken}
    ORDER BY p.created_at
    LIMIT 1
  `;

  const profileId: string = existing?.id ?? randomUUID();
  const attemptNo: number = (existing?.last_attempt ?? 0) + 1;
  const { axes, typeId, subtypeId } = scoreProfile(input.answers, questions);

  const saveProfile = existing
    ? sql`
        UPDATE ${profiles} SET
          nickname = ${input.nickname}, gender = ${input.gender}, age_band = ${input.ageBand},
          main_type_id = ${typeId}, subtype_id = ${subtypeId},
          novelty_score = ${axes.novelty}, structure_score = ${axes.structure},
          social_score = ${axes.social}, spend_score = ${axes.spend},
          stimulation_score = ${axes.stimulation}, independence_score = ${axes.independence},
          updated_at = now()
        WHERE id = ${profileId}
      `
    : sql`
        INSERT INTO ${profiles}
          (id, anonymous_token, nickname, gender, age_band, main_type_id, subtype_id,
           novelty_score, structure_score, social_score, spend_score, stimulation_score, independence_score)
        VALUES
          (${profileId}, ${input.anonymousToken}, ${input.nickname}, ${input.gender}, ${input.ageBand},
           ${typeId}, ${subtypeId},
           ${axes.novelty}, ${axes.structure}, ${axes.social}, ${axes.spend}, ${axes.stimulation}, ${axes.independence})
      `;

  const saveResponses = sql`
    INSERT INTO ${responses} (id, profile_id, attempt_no, question_id, answer, test_version)
    SELECT t.id, ${profileId}, ${attemptNo}, t.question_id, t.answer, ${TEST_VERSION}
    FROM unnest(
      ${input.answers.map(() => randomUUID())}::uuid[],
      ${input.answers.map(a => a.questionId)}::uuid[],
      ${input.answers.map(a => a.answer)}::varchar[]
    ) AS t(id, question_id, answer)
  `;

  try {
    await sql.transaction([saveProfile, saveResponses]);
  } catch (err) {
    if (err instanceof NeonDbError && err.code === UNIQUE_VIOLATION) return 'conflict';
    throw err;
  }
  return { profileId, attemptNo };
}

export type OwnProfile = {
  id: string;
  nickname: string;
  typeId: TypeId;
  subtypeId: TypeId | null;
  axes: Axes;
};

// id와 토큰이 둘 다 맞는 프로필만 돌려준다. 남의 프로필과 없는 프로필을 구분하지 않는다.
export async function loadOwnProfile(id: string, anonymousToken: string): Promise<OwnProfile | null> {
  const sql = getSql();
  const [row] = await sql`
    SELECT id, nickname, main_type_id, subtype_id,
           novelty_score, structure_score, social_score, spend_score, stimulation_score, independence_score
    FROM ${table('profiles')}
    WHERE id = ${id} AND anonymous_token = ${anonymousToken}
  `;
  if (!row || !row.main_type_id) return null;
  return {
    id: row.id,
    nickname: row.nickname,
    typeId: row.main_type_id,
    subtypeId: row.subtype_id,
    axes: {
      novelty: row.novelty_score, structure: row.structure_score, social: row.social_score,
      spend: row.spend_score, stimulation: row.stimulation_score, independence: row.independence_score,
    },
  };
}
