import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SYNC_GRADES } from './sync-content.ts';
import { gradeFor } from './sync-grade.ts';

describe('gradeFor', () => {
  // 경계값은 임시값이라 바뀐다. SYNC_GRADES에서 읽어 검증한다.
  it('각 등급의 min에서 그 등급이 되고, min - 1에서는 바로 아래 등급이 된다', () => {
    SYNC_GRADES.forEach((grade, i) => {
      assert.equal(gradeFor(grade.min), grade, `${grade.name} ${grade.min}`);
      const below = SYNC_GRADES[i + 1];
      if (below) assert.equal(gradeFor(grade.min - 1), below, `${grade.name} ${grade.min - 1}`);
    });
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
