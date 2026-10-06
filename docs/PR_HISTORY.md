## PR #1 — Sprint 0 Prototype 초안 · 가중 거리 타입 판정 · 검증 스크립트 · 08e88d6 (2026-10-06)

### 상태 : OPEN

### 반영 확인
* `weightedDistance()`의 `/ wsum` 정규화, `resolveType()`의 balance_player 규칙 분리와 subtype 판정이 스펙 §3.3대로 구현됨
* Prototype 좌표·가중치 임시값이 TODO 표기와 함께 `prototypes.ts` 한 파일에 모여 있음
* 두 스크립트를 재실행해 PR 본문 수치와 일치하는 것 확인 (seed 1: 거리 10 미만 쌍 0개, 최대 14.7% / 최소 3.7%, subtype 40.9%)

### 개선 필요
* `SUBTYPE_GAP = 3`(절댓값)이 1·2등 거리 차의 중앙값(3.7)과 거의 같아서, balance_player를 제외한 사용자의 42.5%에 subtype이 붙음. 경계 사용자만 골라내려는 의도와 어긋남. 1등 거리 대비 비율 기준(`SUBTYPE_RATIO = 0.06`)으로 바꾸면 seed 1~3에서 17.5~17.9%로 안정적
* `simulate-types.ts`가 타입별 분포만 출력해서 실제로 어떤 타입끼리 헷갈리는지 보이지 않음. Prototype 간 거리 순서와 실제 사용자 기준 혼동 순서가 다름 (행렬상 최근접 쌍은 `planned_hedonist ↔ premium_experiencer` 13.3인데, 시뮬레이션상 최다 혼동 쌍은 `spontaneous_explorer ↔ weekend_wanderer` 2.9%)

---

