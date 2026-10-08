import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { IMAGE_LINK_TTL_MS, imageLinkPath, signImageLink, verifyImageLink } from './image-link.ts';

const PROFILE = '6d615bcc-be44-4bd1-bb1e-317eaea8ace7';
const TOKEN = '59d9e9b1-fc05-4216-adea-4329ff2694b4';
const NOW = 1_800_000_000_000;
const EXP = NOW + IMAGE_LINK_TTL_MS;

describe('verifyImageLink', () => {
  const sig = signImageLink(PROFILE, TOKEN, EXP);

  it('발급한 서명은 만료 전까지 통과한다', () => {
    assert.equal(verifyImageLink(PROFILE, TOKEN, EXP, sig, NOW), true);
    assert.equal(verifyImageLink(PROFILE, TOKEN, EXP, sig, EXP - 1), true);
  });

  it('만료 시각이 되면 통과하지 못한다', () => {
    assert.equal(verifyImageLink(PROFILE, TOKEN, EXP, sig, EXP), false);
    assert.equal(verifyImageLink(PROFILE, TOKEN, EXP, sig, EXP + 1), false);
  });

  it('다른 프로필, 다른 토큰, 바꾼 만료 시각에는 맞지 않는다', () => {
    assert.equal(verifyImageLink('11111111-2222-4333-8444-555555555555', TOKEN, EXP, sig, NOW), false);
    assert.equal(verifyImageLink(PROFILE, 'f629109b-e0f4-4cf7-8242-873b7c27216e', EXP, sig, NOW), false);
    assert.equal(verifyImageLink(PROFILE, TOKEN, EXP - 1000, sig, NOW), false);
  });

  it('만료 시각을 유효 기간보다 멀리 잡은 링크는 서명이 맞아도 거부한다', () => {
    const far = NOW + IMAGE_LINK_TTL_MS * 100;
    assert.equal(verifyImageLink(PROFILE, TOKEN, far, signImageLink(PROFILE, TOKEN, far), NOW), false);
  });

  it('깨진 값은 거부한다', () => {
    assert.equal(verifyImageLink(PROFILE, TOKEN, EXP, '', NOW), false);
    assert.equal(verifyImageLink(PROFILE, TOKEN, EXP, sig.slice(0, -1), NOW), false);
    assert.equal(verifyImageLink(PROFILE, TOKEN, Number.NaN, sig, NOW), false);
  });
});

describe('imageLinkPath', () => {
  it('주소에 토큰은 들어가지 않고, 그 주소의 값으로 검증이 통과한다', () => {
    const path = imageLinkPath(PROFILE, TOKEN, NOW);
    assert.ok(!path.includes(TOKEN));
    const url = new URL(path, 'http://localhost');
    assert.equal(url.pathname, `/api/profile/${PROFILE}/image`);
    const exp = Number(url.searchParams.get('exp'));
    assert.equal(exp, EXP);
    assert.equal(verifyImageLink(PROFILE, TOKEN, exp, url.searchParams.get('sig')!, NOW), true);
  });
});
