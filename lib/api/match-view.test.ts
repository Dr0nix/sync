import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TYPE_CONTENT } from '../scoring/v1/content.ts';
import { SITUATIONS } from '../scoring/v1/sync-content.ts';
import { gradeFor } from '../scoring/v1/sync-grade.ts';
import { buildMatchResult, type QuestionTexts, type StoredMatch } from './match-view.ts';

const TEXTS: QuestionTexts = new Map<string, { text: string; options: Record<string, string> }>([
  ['q1', { text: '식당 선택은', options: { a: '늘 먹던 맛집', b: '새로 생긴 곳' } }],
  ['q2', { text: '여행은', options: { a: '큰 틀이라도 미리 짠다', b: '가서 정한다' } }],
  ['q3', { text: '여행 예산에서 하나만 올린다면', options: { a: '숙소', b: '음식', c: '쇼핑', d: '액티비티' } }],
]);

const MATCH: StoredMatch = {
  id: 'm1',
  score: 63,
  categoryScores: { social: 100, food: 80, travel: 20 },
  matched: [{ questionId: 'q1', answer: 'b' }],
  mismatched: [{ questionId: 'q2', a: 'a', b: 'b' }, { questionId: 'q3', a: 'c', b: 'd' }],
  a: { nickname: '지승', typeId: 'planned_hedonist' },
  b: { nickname: '민수', typeId: 'comfort_first' },
};

describe('buildMatchResult — 당사자', () => {
  it('a가 보면 me가 a다', () => {
    const r = buildMatchResult(MATCH, TEXTS, 'a');
    assert.equal(r.me.nickname, '지승');
    assert.equal(r.friend.nickname, '민수');
    assert.equal(r.detail?.me.type?.name, TYPE_CONTENT.planned_hedonist.name);
    assert.equal(r.detail?.friend.type?.id, 'comfort_first');
    assert.deepEqual(r.detail?.mismatched[0], { question: '여행은', me: '큰 틀이라도 미리 짠다', friend: '가서 정한다' });
  });

  it('b가 보면 me가 b이고 차이점의 방향도 뒤집힌다', () => {
    const r = buildMatchResult(MATCH, TEXTS, 'b');
    assert.equal(r.me.nickname, '민수');
    assert.equal(r.friend.nickname, '지승');
    assert.equal(r.detail?.me.type?.id, 'comfort_first');
    assert.deepEqual(r.detail?.mismatched, [
      { question: '여행은', me: '가서 정한다', friend: '큰 틀이라도 미리 짠다' },
      { question: '여행 예산에서 하나만 올린다면', me: '액티비티', friend: '쇼핑' },
    ]);
  });

  it('점수·등급·공통점은 누가 봐도 같다', () => {
    const a = buildMatchResult(MATCH, TEXTS, 'a'), b = buildMatchResult(MATCH, TEXTS, 'b');
    assert.equal(a.score, 63);
    assert.deepEqual(a.grade, { name: gradeFor(63).name, copy: gradeFor(63).copy });
    assert.deepEqual(a.grade, b.grade);
    assert.deepEqual(a.detail?.matched, [{ question: '식당 선택은', answer: '새로 생긴 곳' }]);
    assert.deepEqual(a.detail?.matched, b.detail?.matched);
  });

  it('카테고리는 정해진 순서와 표시 이름으로 나간다', () => {
    const r = buildMatchResult(MATCH, TEXTS, 'a');
    assert.deepEqual(r.detail?.categories, [
      { id: 'food', label: '음식', score: 80 },
      { id: 'travel', label: '여행', score: 20 },
      { id: 'social', label: '관계', score: 100 },
    ]);
    assert.deepEqual(r.detail?.goodAt, [SITUATIONS.social.good, SITUATIONS.food.good]);
    assert.deepEqual(r.detail?.clashAt, [SITUATIONS.travel.clash]);
  });

  it('문항이나 선택지 문구를 찾지 못한 항목은 뺀다', () => {
    const match: StoredMatch = {
      ...MATCH,
      matched: [{ questionId: 'gone', answer: 'a' }, { questionId: 'q1', answer: 'z' }, { questionId: 'q1', answer: 'a' }],
      mismatched: [{ questionId: 'gone', a: 'a', b: 'b' }, { questionId: 'q2', a: 'a', b: 'z' }],
    };
    const r = buildMatchResult(match, TEXTS, 'a');
    assert.deepEqual(r.detail?.matched, [{ question: '식당 선택은', answer: '늘 먹던 맛집' }]);
    assert.deepEqual(r.detail?.mismatched, []);
  });

  it('타입이 없는 프로필은 type이 null이다', () => {
    const r = buildMatchResult({ ...MATCH, b: { nickname: '민수', typeId: null } }, TEXTS, 'a');
    assert.equal(r.detail?.friend.type, null);
  });
});

describe('buildMatchResult — 제3자', () => {
  const r = buildMatchResult(MATCH, TEXTS, null);

  it('닉네임·점수·등급만 나가고 detail은 null이다', () => {
    assert.deepEqual(r, {
      matchId: 'm1',
      score: 63,
      grade: { name: gradeFor(63).name, copy: gradeFor(63).copy },
      me: { nickname: '지승' },
      friend: { nickname: '민수' },
      detail: null,
    });
  });

  it('응답 어디에도 선택지 문구나 타입이 들어 있지 않다', () => {
    const text = JSON.stringify(r);
    for (const leaked of ['맛집', '미리 짠다', '숙소', 'planned_hedonist', TYPE_CONTENT.comfort_first.name]) {
      assert.ok(!text.includes(leaked), leaked);
    }
  });
});
