// 서버 전용. 매치를 만들고 조회한다. 두 사람의 원본 응답은 여기서만 읽고 밖으로 내보내지 않는다(스펙 §12).
import { randomUUID } from 'node:crypto';
import type { MatchSide, QuestionTexts, StoredMatch, Viewer } from '../api/match-view.ts';
import { SCORING_VERSION, computeSync, type ResponseItem } from '../scoring/v1/index.ts';
import { getSql, table } from './client.ts';
import { loadQuestions } from './questions.ts';

// 같은 두 사람·같은 회차의 매치가 이미 있으면 그 id를 돌려주고, 없으면 계산해서 저장한다.
// 누가 초대했는지와 상관없이 id가 작은 쪽을 a로 저장한다(matches_pair_order_check).
// 한쪽이라도 응답이 없으면 'no_responses'.
export async function createOrGetMatch(profileX: string, profileY: string): Promise<string | 'no_responses'> {
  const sql = getSql();
  const matches = table('matches');
  const responses = table('responses');
  const [a, b] = profileX < profileY ? [profileX, profileY] : [profileY, profileX];

  const latest = await sql`
    SELECT profile_id, max(attempt_no) AS attempt_no
    FROM ${responses}
    WHERE profile_id IN (${a}, ${b})
    GROUP BY profile_id
  `;
  const attemptA = latest.find(r => r.profile_id === a)?.attempt_no as number | undefined;
  const attemptB = latest.find(r => r.profile_id === b)?.attempt_no as number | undefined;
  if (attemptA === undefined || attemptB === undefined) return 'no_responses';

  const findExisting = () => sql`
    SELECT id FROM ${matches}
    WHERE profile_a_id = ${a} AND profile_b_id = ${b}
      AND profile_a_attempt = ${attemptA} AND profile_b_attempt = ${attemptB}
  `;
  const [existing] = await findExisting();
  if (existing) return existing.id;

  const [rows, questions] = await Promise.all([
    sql`
      SELECT profile_id, question_id, answer
      FROM ${responses}
      WHERE (profile_id = ${a} AND attempt_no = ${attemptA})
         OR (profile_id = ${b} AND attempt_no = ${attemptB})
    `,
    loadQuestions(),
  ]);
  const of = (profileId: string): ResponseItem[] =>
    rows.filter(r => r.profile_id === profileId).map(r => ({ questionId: r.question_id, answer: r.answer }));

  const id = randomUUID();
  const sync = computeSync(of(a), of(b), questions, `${a}:${b}`);   // a < b로 정렬된 쌍이라 누가 초대했든 같은 값

  // 동시에 두 번 들어오면 한쪽은 유일 제약에 걸려 아무것도 넣지 않는다. 그때는 먼저 들어간 매치를 돌려준다.
  const [inserted] = await sql`
    INSERT INTO ${matches}
      (id, profile_a_id, profile_b_id, profile_a_attempt, profile_b_attempt, mode,
       sync_score, category_scores, matched_items, mismatched_items, scoring_version)
    VALUES
      (${id}, ${a}, ${b}, ${attemptA}, ${attemptB}, 'friend',
       ${sync.score}, ${JSON.stringify(sync.categoryScores)}::jsonb,
       ${JSON.stringify(sync.matched)}::jsonb, ${JSON.stringify(sync.mismatched)}::jsonb, ${SCORING_VERSION})
    ON CONFLICT ON CONSTRAINT matches_pair_attempt_key DO NOTHING
    RETURNING id
  `;
  if (inserted) return inserted.id;
  const [winner] = await findExisting();
  return winner.id;
}

export type LoadedMatch = { match: StoredMatch; texts: QuestionTexts; viewer: Viewer };

// 매치와, 화면에 붙일 문항 문구를 읽는다. 토큰이 두 당사자 중 누구 것인지도 여기서 가린다.
// 토큰 자체는 돌려주지 않는다.
export async function loadMatch(id: string, anonymousToken: string | null): Promise<LoadedMatch | null> {
  const sql = getSql();
  const profiles = table('profiles');

  const [row] = await sql`
    SELECT m.id, m.sync_score, m.category_scores, m.matched_items, m.mismatched_items,
           pa.nickname AS a_nickname, pa.main_type_id AS a_type, pa.anonymous_token = ${anonymousToken} AS is_a,
           pb.nickname AS b_nickname, pb.main_type_id AS b_type, pb.anonymous_token = ${anonymousToken} AS is_b
    FROM ${table('matches')} m
    JOIN ${profiles} pa ON pa.id = m.profile_a_id
    JOIN ${profiles} pb ON pb.id = m.profile_b_id
    WHERE m.id = ${id}
  `;
  if (!row) return null;

  const side = (nickname: string, typeId: string | null): MatchSide =>
    ({ nickname, typeId: typeId as MatchSide['typeId'] });
  const match: StoredMatch = {
    id: row.id,
    score: row.sync_score,
    categoryScores: row.category_scores ?? {},
    matched: row.matched_items ?? [],
    mismatched: row.mismatched_items ?? [],
    a: side(row.a_nickname, row.a_type),
    b: side(row.b_nickname, row.b_type),
  };
  const viewer: Viewer = row.is_a ? 'a' : row.is_b ? 'b' : null;

  // 제3자에게는 문구가 필요 없다.
  const texts: QuestionTexts = new Map();
  if (viewer !== null) {
    const ids = [...match.matched, ...match.mismatched].map(i => i.questionId);
    const questions = ids.length === 0 ? [] : await sql`
      SELECT id, text, option_a, option_b, option_c, option_d
      FROM ${table('questions')}
      WHERE id = ANY(${ids}::uuid[])
    `;
    for (const q of questions) {
      const options: Record<string, string> = {};
      for (const key of ['a', 'b', 'c', 'd']) {
        const label = q[`option_${key}`];
        if (label) options[key] = label;
      }
      texts.set(q.id, { text: q.text, options });
    }
  }

  return { match, texts, viewer };
}

export type FriendMatch = { matchId: string; nickname: string; score: number };

// 내가 비교한 친구 목록. 친구마다 가장 최근 매치 하나만, 최신순으로.
export async function listFriendMatches(profileId: string): Promise<FriendMatch[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM (
      SELECT DISTINCT ON (friend.id) m.id, m.sync_score, m.created_at, friend.nickname
      FROM ${table('matches')} m
      JOIN ${table('profiles')} friend
        ON friend.id = CASE WHEN m.profile_a_id = ${profileId} THEN m.profile_b_id ELSE m.profile_a_id END
      WHERE m.profile_a_id = ${profileId} OR m.profile_b_id = ${profileId}
      ORDER BY friend.id, m.created_at DESC
    ) latest
    ORDER BY created_at DESC
  `;
  return rows.map(r => ({ matchId: r.id, nickname: r.nickname, score: r.sync_score }));
}
