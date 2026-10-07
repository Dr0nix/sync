// 서버 전용. 초대 코드를 만들고 찾는다.
import { randomInt, randomUUID } from 'node:crypto';
import { cache } from 'react';
import { getSql, table } from './client.ts';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const CODE_LENGTH = 12;   // 62^12 ≈ 3×10^21. 추측할 수 없는 랜덤값(스펙 §12)

export const INVITE_CODE = new RegExp(`^[0-9A-Za-z]{${CODE_LENGTH}}$`);

const newCode = () => Array.from({ length: CODE_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');

// 프로필당 초대 코드 하나를 계속 쓴다. 코드는 응답이 아니라 프로필을 가리키므로 재응시해도 유효하다.
export async function getOrCreateInviteCode(profileId: string): Promise<string> {
  const sql = getSql();
  const invites = table('invites');

  const [existing] = await sql`
    SELECT invite_code FROM ${invites}
    WHERE inviter_profile_id = ${profileId} AND mode = 'friend'
    ORDER BY created_at
    LIMIT 1
  `;
  if (existing) return existing.invite_code;

  const code = newCode();
  await sql`
    INSERT INTO ${invites} (id, inviter_profile_id, invite_code, mode)
    VALUES (${randomUUID()}, ${profileId}, ${code}, 'friend')
  `;
  return code;
}

// 유효한 초대 코드면 초대한 사람의 id와 닉네임을 돌려준다. 타입·점수·토큰은 읽지 않는다.
// cache()로 감싸서 한 요청 안에서 generateMetadata와 페이지가 DB를 두 번 조회하지 않게 한다.
export const findInviter = cache(async (code: string): Promise<{ id: string; nickname: string } | null> => {
  if (!INVITE_CODE.test(code)) return null;
  const sql = getSql();
  const [row] = await sql`
    SELECT p.id, p.nickname
    FROM ${table('invites')} i
    JOIN ${table('profiles')} p ON p.id = i.inviter_profile_id
    WHERE i.invite_code = ${code} AND (i.expires_at IS NULL OR i.expires_at > now())
  `;
  return row ? { id: row.id, nickname: row.nickname } : null;
});

// 유효한 초대 코드면 초대한 프로필의 id를 돌려준다.
export async function findInviterId(code: string): Promise<string | null> {
  return (await findInviter(code))?.id ?? null;
}
