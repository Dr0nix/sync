import { SYNC_GRADES, type SyncGrade } from './sync-content.ts';

// SYNC 점수(0~100)의 등급. 범위를 벗어난 값은 양 끝 등급으로 본다.
export function gradeFor(score: number): SyncGrade {
  return SYNC_GRADES.find(g => score >= g.min) ?? SYNC_GRADES[SYNC_GRADES.length - 1];
}
