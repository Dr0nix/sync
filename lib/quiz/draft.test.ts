import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { INTERMISSIONS } from '../content/ui-copy.ts';
import {
  answerCurrent, emptyDraft, firstUnanswered, goBack, isComplete, isIntermission, restoreDraft,
  type Draft,
} from './draft.ts';
import type { TestQuestion } from './types.ts';

const binary = [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }];
const QUESTIONS: TestQuestion[] = [
  { id: 'q1', text: '1', options: binary },
  { id: 'q2', text: '2', options: binary },
  { id: 'q3', text: '3', options: [...binary, { key: 'c', label: 'C' }, { key: 'd', label: 'D' }] },
];
const V = 1;

const saved = (draft: Partial<Draft>) => JSON.stringify({ ...emptyDraft(V), ...draft });

describe('answerCurrent / goBack', () => {
  it('답하면 저장하고 다음 문항으로 넘어간다', () => {
    const d = answerCurrent({ ...emptyDraft(V), started: true }, QUESTIONS, 'b');
    assert.deepEqual(d.answers, { q1: 'b' });
    assert.equal(d.index, 1);
  });

  it('문항에 없는 선택지는 무시한다', () => {
    const start = { ...emptyDraft(V), started: true };
    assert.equal(answerCurrent(start, QUESTIONS, 'c'), start);
  });

  it('뒤로 가서 답을 바꿀 수 있다', () => {
    let d = answerCurrent({ ...emptyDraft(V), started: true }, QUESTIONS, 'a');
    d = goBack(d);
    assert.equal(d.index, 0);
    d = answerCurrent(d, QUESTIONS, 'b');
    assert.deepEqual(d.answers, { q1: 'b' });
  });

  it('첫 문항에서 뒤로 가면 닉네임 입력으로 돌아가고 응답은 남는다', () => {
    const d = goBack({ ...emptyDraft(V), started: true, answers: { q1: 'a' } });
    assert.equal(d.started, false);
    assert.deepEqual(d.answers, { q1: 'a' });
  });

  it('전부 답하면 완료 상태다', () => {
    let d: Draft = { ...emptyDraft(V), started: true };
    for (const key of ['a', 'b', 'd']) d = answerCurrent(d, QUESTIONS, key);
    assert.ok(isComplete(d, QUESTIONS));
    assert.equal(d.index, QUESTIONS.length);
    assert.equal(firstUnanswered(d, QUESTIONS), 3);
  });
});

describe('restoreDraft', () => {
  it('저장된 값이 없거나 깨졌으면 빈 상태다', () => {
    assert.deepEqual(restoreDraft(null, QUESTIONS, V), emptyDraft(V));
    assert.deepEqual(restoreDraft('{oops', QUESTIONS, V), emptyDraft(V));
    assert.deepEqual(restoreDraft('null', QUESTIONS, V), emptyDraft(V));
  });

  it('진행 중이던 상태를 그대로 되살린다', () => {
    const d = restoreDraft(saved({ nickname: '지승', started: true, index: 2, answers: { q1: 'a', q2: 'b' } }), QUESTIONS, V);
    assert.equal(d.nickname, '지승');
    assert.equal(d.started, true);
    assert.equal(d.index, 2);
    assert.deepEqual(d.answers, { q1: 'a', q2: 'b' });
  });

  it('문항 버전이 다르면 처음부터다', () => {
    assert.deepEqual(restoreDraft(saved({ nickname: '지승', answers: { q1: 'a' } }), QUESTIONS, 2), emptyDraft(2));
  });

  it('없어진 문항과 선택지의 응답은 버린다', () => {
    const d = restoreDraft(saved({ started: true, index: 3, answers: { q1: 'a', q2: 'z', gone: 'a' } }), QUESTIONS, V);
    assert.deepEqual(d.answers, { q1: 'a' });
    assert.equal(d.index, 1);   // 답하지 않은 첫 문항으로 당겨진다
  });

  it('답하지 않은 문항을 건너뛴 위치로 복원하지 않는다', () => {
    assert.equal(restoreDraft(saved({ started: true, index: 99, answers: { q1: 'a' } }), QUESTIONS, V).index, 1);
    assert.equal(restoreDraft(saved({ started: true, index: -5, answers: { q1: 'a' } }), QUESTIONS, V).index, 0);
  });

  it('뒤로 가 있던 위치는 유지한다', () => {
    assert.equal(restoreDraft(saved({ started: true, index: 0, answers: { q1: 'a', q2: 'b' } }), QUESTIONS, V).index, 0);
  });
});

describe('isIntermission', () => {
  it('20문항마다이고 처음과 마지막 뒤에는 없다', () => {
    assert.equal(isIntermission(0, 60), false);
    assert.equal(isIntermission(10, 60), false);
    assert.equal(isIntermission(19, 60), false);
    assert.equal(isIntermission(20, 60), true);
    assert.equal(isIntermission(40, 60), true);
    assert.equal(isIntermission(50, 60), false);
    assert.equal(isIntermission(60, 60), false);
  });

  it('60문항에서는 20, 40문항 뒤 두 번만 나오고 카드 문구도 그 수만큼 있다', () => {
    const points = Array.from({ length: 61 }, (_, i) => i).filter(i => isIntermission(i, 60));
    assert.deepEqual(points, [20, 40]);
    assert.equal(INTERMISSIONS.length, points.length);
  });
});
