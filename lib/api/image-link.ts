// 내 결과 이미지의 임시 링크. 서버 전용.
// 카카오톡 같은 앱 내장 브라우저는 헤더를 붙일 수 없는 일반 주소로만 이미지를 저장·내려받을 수 있다.
// 그래서 본인 확인을 마친 뒤, 잠깐만 유효한 서명을 주소에 붙여 준다. 토큰 자체는 주소에 넣지 않는다.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const IMAGE_LINK_TTL_MS = 10 * 60 * 1000;

// 프로필의 익명 토큰을 키로 쓴다. 토큰을 모르면 서명을 만들 수 없고, 다른 프로필이나 다른 만료 시각에는 맞지 않는다.
export function signImageLink(profileId: string, anonymousToken: string, expiresAt: number): string {
  return createHmac('sha256', anonymousToken).update(`image:${profileId}:${expiresAt}`).digest('base64url');
}

export function verifyImageLink(
  profileId: string, anonymousToken: string, expiresAt: number, signature: string, now: number = Date.now(),
): boolean {
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  // 만료 시각을 멀리 잡은 링크를 받아주지 않는다.
  if (expiresAt - now > IMAGE_LINK_TTL_MS) return false;
  const expected = Buffer.from(signImageLink(profileId, anonymousToken, expiresAt));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function imageLinkPath(profileId: string, anonymousToken: string, now: number = Date.now()): string {
  const expiresAt = now + IMAGE_LINK_TTL_MS;
  const signature = signImageLink(profileId, anonymousToken, expiresAt);
  return `/api/profile/${profileId}/image?exp=${expiresAt}&sig=${signature}`;
}
