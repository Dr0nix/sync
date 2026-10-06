import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SYNC_GRADES } from './sync-content.ts';
import { gradeFor } from './sync-grade.ts';

describe('gradeFor', () => {
  it('스펙 §4의 경계값대로 등급을 고른다', () => {
    const cases: [number, string][] = [
      [100, 'CTRL+C CTRL+V'], [95, 'CTRL+C CTRL+V'],
      [94, '취향 쌍둥이'], [90, '취향 쌍둥이'],
      [89, '찐친 정배'], [80, '찐친 정배'],
      [79, '제법 잘 맞음'], [70, '제법 잘 맞음'],
      [69, '다름을 즐기는 사이'], [60, '다름을 즐기는 사이'],
      [59, '우리가 왜 친하지?'], [50, '우리가 왜 친하지?'],
      [49, '기적의 우정'], [30, '기적의 우정'],
      [29, '상극 생존자'], [0, '상극 생존자'],
    ];
    for (const [score, name] of cases) assert.equal(gradeFor(score).name, name, String(score));
  });

  it('범위를 벗어난 값은 양 끝 등급이다', () => {
    assert.equal(gradeFor(120).name, 'CTRL+C CTRL+V');
    assert.equal(gradeFor(-5).name, '상극 생존자');
  });
});

describe('SYNC_GRADES 정합성', () => {
  it('높은 등급부터 내림차순이고 0에서 끝난다', () => {
    const mins = SYNC_GRADES.map(g => g.min);
    assert.deepEqual(mins, [...mins].sort((a, b) => b - a));
    assert.equal(mins[mins.length - 1], 0);
    assert.equal(new Set(mins).size, mins.length);
  });
});
