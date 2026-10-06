# SYNC — 취향 프로파일 × 친구 궁합 MVP 개발 스펙

> 이 문서는 Claude Code에게 전달하는 구현 기준 문서다.
> 기획 배경 설명보다 **무엇을 만들고, 무엇을 만들지 않는지**를 우선한다.

---

## 0. 프로젝트 한 줄 정의

생일·이름 같은 랜덤 요소가 아니라 **사용자가 직접 선택한 취향 응답 데이터**로
(1) 개인 취향 타입을 지정하고 (2) 친구와의 실제 응답 일치율(SYNC %)을 보여주는 모바일 우선 웹 서비스.

**핵심 루프**

```
TEST → TYPE → SHARE → FRIEND TEST → SYNC → SHARE AGAIN
```

---

## 1. 기술 스택 (확정)

| 영역 | 선택 |
| --- | --- |
| Frontend | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS, 모바일 우선 |
| DB | Neon Postgres (`@neondatabase/serverless`) |
| Auth | 미정 — Sprint 3에서 선택적 로그인 방식을 정한다 |
| 보안 | Row Level Security |
| Deploy | Vercel |
| Analytics | PostHog 또는 GA4 |
| 공유 이미지 | Next.js OG Image (서버 생성) |

**백엔드는 별도 서버가 아니라 Next.js Route Handler(Node 런타임)다.** Java/Spring 미사용.
Neon은 DB 레이어로만 쓰고, 애플리케이션 로직은 전부 Route Handler에 둔다.

### 쓰지 않는 것 (원가/복잡도 이유)

- LLM / AI 문장 생성 **없음** — 결과 문장은 전부 룰 템플릿
- WebSocket, 영상 처리, 대형 파일 스토리지 없음
- 결제 없음

### 비용 구조 (알고 있을 것)

- Vercel Hobby는 **비상업용 전용**. AdSense를 붙이는 순간 Pro($20/월) 필요.
  → 광고는 베타 이후에 붙인다. 개발·베타 기간엔 Hobby로 $0.
- Neon은 유휴 상태가 이어지면 compute를 자동으로 멈추고, 다음 접속 때 다시 깨운다(첫 요청에 콜드스타트).
  → 깨우기 위한 ping 워크플로는 만들지 않는다.
- 서버리스 특성상 트래픽이 없으면 비용도 0에 수렴한다. 상시 인스턴스를 추가하지 말 것.
- **CPU를 가장 많이 먹는 건 OG 이미지 생성**이다. 카톡·인스타 크롤러가 반복 요청하므로 반드시 캐싱한다(§14 Sprint 2).

---

## 2. MVP 범위

### IN

- 닉네임 입력 (2~12자, 실명 요구 안 함)
- 성별 / 연령대 — **선택 입력, 건너뛰기 가능**
- 60문항 취향 테스트 (모바일 풀스크린, 1화면 1문항)
- 6축 점수 계산 → 메인 타입 1개 판정
- 개인 결과 페이지 (타입 + 양극형 막대 6개 + 설명 3개 + 의외의 조합 1~2개)
- 고유 초대 링크 생성 / 친구 테스트 / FRIEND SYNC 결과
- 익명 브라우저 세션(`anonymous_token`) 기반 프로필
- 기존 프로필 재사용 (재응답 없이 새 Match 생성)
- Google AdSense — 결과 페이지 **하단에만**

### OUT (이번에 만들지 않음)

공개 피드 / 팔로우·좋아요·댓글 / 채팅 / AI 생성 / 추천 알고리즘 / 결제 /
네이티브 앱 / 위치기반 / 그룹 궁합 매트릭스 / 사용자 문항 생성 / 관리자 CMS / LOVE 모드 구현

> **판단 기준:** "테스트 시작 → 친구와 SYNC 결과 확인"에 필요 없으면 뺀다.

---

## 3. 취향 측정 모델

### 3.1 6축 정의

| key | 왼쪽 Pole | 오른쪽 Pole | 측정 대상 |
| --- | --- | --- | --- |
| `novelty` | 익숙함 | 새로움 | 새 장소·음식·경험 탐색 적극성 |
| `structure` | 즉흥 | 계획 | 활동을 미리 구조화하는 선호 |
| `social` | 혼자·소수 | 함께·다수 | 여가에서 사람·사회적 자극 선호 |
| `spend` | 실용·절약 | 경험·프리미엄 | 가격효율보다 경험 질에 지불 |
| `stimulation` | 편안함 | 강한 자극 | 강한 맛·활동·밤문화 선호 |
| `independence` | 공유 | 독립 | 타인에게 맞추기보다 자기 방식 |

점수 범위 0~100, 50이 중립선.

### 3.2 점수 계산

각 문항은 `axis` 하나와 `scoring_key`(선택지 → 축 기여값)를 갖는다.
축별 점수 = 해당 축 문항들의 정규화 평균 → 0~100 반올림.
역방향 문항 포함 필수(응답 편향 점검용).

### 3.3 타입 판정 — 가중 Prototype Vector 방식

if문 분기 대신, 12개 타입 각각에 **6축 좌표 + 축별 가중치**를 정의하고
사용자 벡터와의 **가중 거리 최소값**으로 타입 1개를 선택한다.

타입은 축 하나가 아니라 6축 조합으로 정의된다. 거리를 재면 6축이 동시에 비교되므로 조합이 자동으로 반영된다.
예: 새로움이 거의 일치해도 structure가 크게 어긋나면 즉흥 탐험가로 판정되지 않는다.

> ⚠️ 이 코드는 **서버(`lib/scoring/v1/`)에서만** 실행된다. 브라우저 번들에 들어가면 안 된다. 이유는 §6.1.

```ts
export const AXES = [
  'novelty', 'structure', 'social', 'spend', 'stimulation', 'independence',
] as const;

type Axis = typeof AXES[number];
type Axes = Record<Axis, number>;

type Prototype = {
  vector: Axes;    // 0~100
  weights: Axes;   // 그 타입을 정의하는 축일수록 크게
};

const PROTOTYPES: Record<TypeId, Prototype> = {
  planned_hedonist: {
    vector:  { novelty: 75, structure: 85, social: 60, spend: 85, stimulation: 65, independence: 55 },
    weights: { novelty: 1.5, structure: 2,  social: 0.5, spend: 2,  stimulation: 1,  independence: 0.3 },
  },
  // ... 12개
};

function weightedDistance(user: Axes, p: Prototype): number {
  let sum = 0, wsum = 0;
  for (const k of AXES) {
    const w = p.weights[k];
    sum  += w * (user[k] - p.vector[k]) ** 2;
    wsum += w;
  }
  return Math.sqrt(sum / wsum);   // ← wsum으로 나누지 않으면 타입 간 비교 불가
}
```

**가중치가 필요한 이유:** 계획형 쾌락주의자를 정의하는 건 `structure`와 `spend`다.
`independence`는 사실상 "상관없음"인데, 순수 유클리드 거리는 어느 축이 어긋나든 동일하게 벌점을 준다.
그러면 정체성 축이 완벽히 맞는데도 무관한 축 때문에 다른 타입에 밀린다.

**`/ wsum` 정규화 필수:** 나누지 않으면 가중치 총합이 큰 타입이 항상 더 멀어져서 영원히 선택되지 않는다.

### 3.3.1 밸런스 플레이어는 거리 경쟁에서 제외

전 축 50 근처인 점은 다차원 공간에서 **모든 방향의 사용자에게 어중간하게 가깝다.**
거리 경쟁에 넣으면 애매한 사용자를 과도하게 흡수하므로 규칙으로 분리한다.

```ts
function resolveType(user: Axes): { typeId: TypeId; subtypeId: TypeId | null } {
  if (AXES.every(k => Math.abs(user[k] - 50) < 15)) {
    return { typeId: 'balance_player', subtypeId: null };
  }

  const ranked = Object.entries(PROTOTYPES)
    .filter(([id]) => id !== 'balance_player')
    .map(([id, p]) => ({ id: id as TypeId, d: weightedDistance(user, p) }))
    .sort((a, b) => a.d - b.d);

  // 1·2등이 거의 붙어 있으면 경계 사용자 → 2등을 subtype으로
  // 임계값 1은 임시값. subtype 비율이 15~20%가 되도록 시뮬레이션으로 맞춘다(3이면 약 40%에 붙는다).
  const subtypeId = (ranked[1].d - ranked[0].d) < 1 ? ranked[1].id : null;
  return { typeId: ranked[0].id, subtypeId };
}
```

`profiles.subtype_id`는 여기서 채워진다.
결과 화면은 여전히 메인 타입 하나만 단정하고(§9 UX 원칙), subtype은 "당신 안에는 즉흥 탐험가도 조금 있습니다" 정도의 보조 문장에만 쓴다.

### 3.3.2 차원 수에 대한 참고

6축 = 6차원이지만 거리 계산은 축 개수만큼 루프를 도는 것뿐이라 2차원과 동일하다.
연산량은 12타입 × 6축 = 곱셈 72회. 시각화가 불가능한 것과 계산 난이도는 무관하다.

단, 고차원에서 "중앙"이 특별한 위치가 아니게 되는 현상은 6차원에서도 약하게 나타난다.
§3.3.1에서 밸런스 플레이어를 분리하는 이유가 이것이다.

이 구조여야 나중에 군집분석 결과로 Prototype만 교체할 수 있다.

### 3.4 12개 타입 (v0 가설)

| id | 이름 | 한 줄 | 대표 성향 |
| --- | --- | --- | --- |
| `planned_hedonist` | 계획형 쾌락주의자 | 놀기 위해 계획합니다. | 계획↑ 경험소비↑ 새로움↑ |
| `spontaneous_explorer` | 즉흥 탐험가 | 일단 가면 뭔가 생깁니다. | 즉흥↑ 새로움↑ 자극↑ |
| `taste_curator` | 취향 큐레이터 | 아무거나 좋다는 말이 제일 어렵습니다. | 독립↑ 새로움↑ |
| `premium_experiencer` | 프리미엄 경험파 | 남는 건 결국 경험이라고 생각합니다. | 경험소비↑ 새로움↑ |
| `pragmatic_realist` | 가성비 현실파 | 좋은 선택보다 납득되는 선택. | 실용↑ 계획↑ 안정↑ |
| `comfort_first` | 안락제일주의자 | 좋았던 데는 이유가 있습니다. | 익숙함↑ 편안함↑ |
| `weekend_wanderer` | 주말 방랑자 | 집을 나서면 계획이 생깁니다. | 즉흥↑ 사회↑ 활동↑ |
| `people_are_content` | 사람이 콘텐츠 | 어디보다 누구랑이 중요합니다. | 사회↑ 공유↑ |
| `solo_deepdiver` | 혼놀 딥다이버 | 혼자여도 심심할 틈이 없습니다. | 독립↑ 소수↑ |
| `mood_hunter` | 분위기 사냥꾼 | 무엇을 하느냐만큼 어디서 하느냐가 중요합니다. | 경험↑ 새로움↑ |
| `routine_lover` | 루틴 애호가 | 내가 좋아하는 방식에는 이유가 있습니다. | 계획↑ 익숙함↑ 편안함↑ |
| `balance_player` | 밸런스 플레이어 | 어디에 데려다 놔도 제법 잘 놉니다. | 대부분 중간 |

---

## 4. SYNC 점수 산식 v0

```
Raw Sync = (동일 응답 문항 수 / 두 사람이 모두 답한 비교가능 문항 수) × 100
```

- 2지선다·4지선다 모두 exact match(일치 1 / 불일치 0)
- 카테고리별 점수 = 해당 카테고리 내 일치율
- 정교한 예측이 목표가 아니라 **"우리가 실제로 얼마나 같은 걸 골랐나"의 직관적 표현**이 목표

### 고도화 후보 (지금 구현하지 않음)

```
Final Sync = 0.7 × Item-level similarity + 0.3 × Axis-profile similarity
```

`matches.scoring_version` 컬럼으로 산식 버전을 남겨둘 것.

### 등급명

| 점수 | 이름 | 카피 |
| --- | --- | --- |
| 95~100 | CTRL+C CTRL+V | 이 정도면 한 사람이 두 계정 쓰는 수준. |
| 90~94 | 취향 쌍둥이 | 고를 때마다 서로 쳐다볼 가능성 높음. |
| 80~89 | 찐친 정배 | 같이 놀면 웬만하면 실패하지 않음. |
| 70~79 | 제법 잘 맞음 | 다르긴 한데 그게 문제될 정도는 아님. |
| 60~69 | 다름을 즐기는 사이 | 취향보다 사람이 좋아서 친구인 듯. |
| 50~59 | 우리가 왜 친하지? | 데이터로는 설명이 잘 안 됩니다. |
| 30~49 | 기적의 우정 | 취향은 싸우는데 우정은 살아남음. |
| 0~29 | 상극 생존자 | 서로의 선택을 이해하려 하지 마세요. |

---

## 5. 데이터 모델

테이블은 Neon DB의 `sync` 스키마(환경변수 `DB_SCHEMA`)에 만든다.

```sql
-- 응답자 프로필 (익명 우선, 로그인은 나중에 귀속)
CREATE TABLE profiles (
  id                 UUID PRIMARY KEY,
  owner_user_id      UUID NULL,
  anonymous_token    VARCHAR NOT NULL,
  nickname           VARCHAR NOT NULL,
  gender             VARCHAR NULL,
  age_band           VARCHAR NULL,
  main_type_id       VARCHAR,
  subtype_id         VARCHAR NULL,
  novelty_score      INT,
  structure_score    INT,
  social_score       INT,
  spend_score        INT,
  stimulation_score  INT,
  independence_score INT,
  created_at         TIMESTAMP DEFAULT now(),
  updated_at         TIMESTAMP DEFAULT now()
);

CREATE TABLE questions (
  id            UUID PRIMARY KEY,
  code          VARCHAR UNIQUE,
  text          VARCHAR,
  category      VARCHAR,        -- travel / food / leisure / spend / social / life
  response_type VARCHAR,        -- binary | quad
  option_a      TEXT,
  option_b      TEXT,
  option_c      TEXT NULL,
  option_d      TEXT NULL,
  axis          VARCHAR,
  scoring_key   JSONB,
  is_active     BOOLEAN DEFAULT true,
  version       INT,
  sort_seed     INT NULL
);

CREATE TABLE responses (
  id            UUID PRIMARY KEY,
  profile_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id   UUID REFERENCES questions(id),
  answer        VARCHAR,
  numeric_value FLOAT NULL,
  test_version  INT,
  answered_at   TIMESTAMP DEFAULT now()
);

CREATE TABLE invites (
  id                 UUID PRIMARY KEY,
  inviter_profile_id UUID REFERENCES profiles(id),
  invite_code        VARCHAR UNIQUE,   -- 추측 불가 랜덤값
  mode               VARCHAR DEFAULT 'friend',
  created_at         TIMESTAMP DEFAULT now(),
  expires_at         TIMESTAMP NULL
);

CREATE TABLE matches (
  id                UUID PRIMARY KEY,
  profile_a_id      UUID REFERENCES profiles(id),
  profile_b_id      UUID REFERENCES profiles(id),
  mode              VARCHAR,
  sync_score        FLOAT,
  category_scores   JSONB,
  matched_items     JSONB,
  mismatched_items  JSONB,
  scoring_version   INT,
  created_at        TIMESTAMP DEFAULT now()
);
```

### 5.1 관계 구조 — 트리 아님, 그래프

```
Profile A ── Match ── Profile B
Profile B ── Match ── Profile C
Profile A ── Match ── Profile C   ← 나중에 추가 가능
```

**응답 데이터는 링크를 만든 사람이 아니라 응답한 본인에게 귀속된다.**
누구 링크로 들어왔든 각자 독립 Node이고, 자기 네트워크의 중심이 될 수 있어야 한다.

### 5.2 익명 세션 흐름

1. 테스트 시작 시 `anonymous_token` 발급
2. 브라우저 localStorage 저장
3. 서버에 익명 Profile 생성
4. 결과 완료 후 "결과 저장하기"에서 로그인 선택 (Sprint 3)
5. 로그인 시 기존 Profile의 `owner_user_id`에 귀속

---

## 6. 실행 위치 & API 경계

### 6.1 채점은 100% 서버에서

**클라이언트는 렌더링만 한다.** 축 점수·타입 판정·SYNC 계산·Insight 생성 전부 서버.

이유 세 가지:

1. **SYNC는 서버 말고는 불가능하다.** §12에서 상대의 전체 응답 비공개를 못 박았는데, 클라에서 계산하려면 상대 `responses`를 브라우저로 내려줘야 한다.
2. **재계산이 막힌다.** §16은 나중에 Prototype 교체와 문항 축소를 전제한다. 클라 채점이면 각 프로필이 접속 당시 번들 버전으로 굳어서 전체 재채점이 불가능하다.
3. **위조 가능하다.** 클라가 점수를 POST하면 아무 값이나 넣을 수 있다. "실제 응답 기반"이 제품의 유일한 차별점인데 데이터가 오염되면 주장 자체가 무너진다.

### 6.2 채점 로직은 프레임워크 비의존 순수 함수

```
/lib/scoring/v1/
  index.ts        scoreProfile() / computeSync()
  axes.ts         축별 점수 집계
  prototypes.ts   12개 Prototype Vector
  insights.ts     룰 템플릿
```

```ts
export function scoreProfile(
  responses: Response[], questions: QuestionMeta[]
): { axes: Axes; typeId: TypeId; insights: string[] }

export function computeSync(
  a: Response[], b: Response[], questions: QuestionMeta[]
): { score: number; categoryScores: Record<string,string>; matched: Item[]; mismatched: Item[] }
```

Route Handler / 재계산 배치 / 유닛 테스트 **세 곳에서 재사용**된다.
산식이 바뀌면 `v1`을 수정하지 말고 `v2/` 디렉토리를 새로 만든다. 그래야 `matches.scoring_version`이 의미를 갖는다.

### 6.3 API 엔드포인트

| 엔드포인트 | 하는 일 |
| --- | --- |
| `POST /api/test/submit` | responses 저장 → 채점 → profiles 파생 컬럼 갱신 → profileId 반환 |
| `POST /api/match` | 양쪽 responses를 **서버에서만** 읽음 → SYNC 계산 → matches 저장 → §12 허용 범위만 반환 |
| `GET /api/profile/[id]` | 결과 조회 (본인 토큰 검증) |
| `GET /api/match/[id]` | 비교 결과 조회 |

### 6.4 DB 접근 규칙

**브라우저에서 DB를 직접 호출하지 않는다.** 연결 문자열과 DB 클라이언트가 클라이언트 번들에 들어가면 안 된다.
모든 DB 접근은 Route Handler 경유, `DATABASE_URL`은 서버 환경변수에만 둔다(`NEXT_PUBLIC_` 접두사 금지).

RLS를 촘촘히 짜는 대신 접근 경로를 하나로 막는 방식이다. `responses` 테이블은 남의 행이 절대 읽히면 안 되는데, 클라 직접 접근을 허용하면 정책 하나만 틀려도 전체 응답이 새어나간다.

### 6.5 클라이언트가 담당하는 것

- 문항 진행 상태 관리
- **localStorage 응답 버퍼** — 새로고침·이탈해도 60문항이 날아가지 않아야 함 (이탈률 직결)
- 결과 렌더링 / 애니메이션 / 공유 트리거

---

## 7. 라우팅 & 컴포넌트

```
/app
  /page.tsx                       Landing
  /test/page.tsx                  Test
  /result/[profileId]/page.tsx    Personal Result
  /i/[inviteCode]/page.tsx        Invite Landing
  /match/[matchId]/page.tsx       Sync Result
  /me/page.tsx                    My Profile

/components
  QuestionCard      ProgressBar       ChoiceButton
  BipolarTasteBar   TypeHeroCard      InsightCard
  ShareCard         SyncScoreHero     CategorySyncBar
  MatchItemCard     InviteCTA
```

---

## 8. 사용자 플로우

### FLOW A — 혼자 들어온 사용자

랜딩 → 닉네임 → (선택정보) → 60문항 → 개인 결과 → "친구랑 비교하기" → 초대 링크 생성 → 공유

### FLOW B — 친구 링크로 들어온 사용자

초대 랜딩(초대자 점수 비공개) → "나도 해보기" → 닉네임 → 동일 테스트 →
**자기 개인 결과 먼저** → "○○이랑 비교하기" → FRIEND SYNC 공개 → 본인 링크 생성

### FLOW C — 이미 테스트한 사용자가 다른 링크 수신

기존 Profile 식별 → 재응답 없이 Match만 생성 → 즉시 비교 결과

> 매번 60문항 재응답시키면 네트워크가 커질수록 이탈한다. Sprint 3에서 반드시 처리.

---

## 9. 화면 요구사항

### 8.1 Landing

- Hero: "나는 대체 무슨 타입일까?" + 미리보기 결과 카드 + `[내 취향 알아보기]`
- 보여주지 말 것: 긴 이론 설명, 회원가입, 개인정보 동의 벽, "정확도 97%" 류 미검증 주장

### 8.2 Question

- 모바일 풀스크린, 한 화면 = 한 문항
- 버튼 2개(binary) 또는 4개(quad)
- 탭하면 자동 다음 문항, 뒤로 가기 수정 가능
- 진행률은 `%` 대신 `18 / 60` 방식도 A/B 테스트
- 10문항마다 인터미션 카드
- 문항 순서는 카테고리별로 몰지 말고 섞어서 제시

### 8.3 개인 결과 페이지

구성 순서:

1. **타입명 (크게)** + 한 줄 카피 + 설명 문단
2. **취향 DNA** — 양극형 가로 막대 6개
   - 6개가 한 화면/한 스크롤에 들어올 것
   - 좌·우 라벨 항상 노출, 가운데 50 기준선 표시, 숫자는 보조정보
   - 공유 이미지에서도 읽혀야 함
3. **나를 설명하는 3가지**
4. **내 안의 이상한 조합** 1~2개
5. CTA: `[친구에게 보내기]` / 보조: 결과 이미지 저장, 링크 복사
6. AdSense 슬롯 (하단)

> "당신은 53% 계획형 쾌락주의자입니다"처럼 애매하게 말하지 않는다.
> **"당신은 계획형 쾌락주의자입니다."** 로 단정하고, 개인차는 막대에서 보여준다.

### 8.4 FRIEND SYNC 결과 페이지

1. `지승 × 민수` / **SYNC 91%** / 등급명 + 등급 카피
2. 영역별 비교 바 (음식/여행/놀기/소비/생활/관계)
3. 🔥 소름 돋게 같은 것 — 일치 문항에서 추출
4. 💥 이상하게 갈리는 것 — 불일치 문항에서 A/B 대비 표시
5. 🎯 둘이 잘 맞는 상황 / ⚠️ 의견 갈릴 상황
6. 공유 CTA + AdSense 슬롯 (하단)

---

## 10. 결과 문장 생성 — AI 없이 룰 템플릿

```ts
if (novelty > 75 && structure > 70)
  addInsight("새로운 걸 좋아하지만 실패 확률은 줄이고 싶어합니다.");

if (spend > 75 && independence > 55)
  addInsight("남들이 뭐라 하든 내가 좋아하는 경험에는 돈을 아끼지 않습니다.");

if (novelty > 70 && structure < 35)
  addInsight("여행지를 정하는 순간보다 여행지에서 생기는 일이 더 중요합니다.");
```

작성해야 할 문장 자산:

- 타입별 기본 설명 3~5개 × 12타입
- 2축 조합 Insight 20~30개
- 극단점수 Insight 12개
- 모순조합(의외의 조합) Insight 15~20개

이 정도면 수백 가지 결과 조합이 나온다.

---

## 11. 문항 Pool v0 (60문항)

> 최종 문항이 아니라 초기 Pool. 베타 후 응답분포·변별도 보고 수정한다.
> 각 문항에 `axis`와 `scoring_key`를 매핑하는 작업이 남아 있음(§14 TODO).

### 10.1 여행 / 이동 (`travel`)

1. 여행은 `큰 틀이라도 미리 짠다` vs `가서 정한다`
2. 숙소는 `돈 써도 좋은 곳` vs `잠만 자면 충분`
3. 여행 중 우연히 발견한 곳은 `일정 바꿔서라도 간다` vs `원래 계획을 지킨다`
4. 휴가는 `새로운 도시` vs `좋았던 곳 재방문`
5. 여행은 `관광·활동` vs `휴양·멍때리기`
6. 맛집 웨이팅 1시간 `가능` vs `다른 곳 간다`
7. 금요일 저녁 갑작스러운 1박 여행 제안 `가능` vs `준비 없이 못 감`
8. 동행이 계획을 안 세우면 `내가 짠다` vs `그냥 흘러간다`
9. 낯선 나라 대중교통 `직접 부딪혀본다` vs `확실한 이동수단을 택한다`
10. (4지선다) 여행 예산에서 하나만 올린다면 `숙소` / `음식` / `쇼핑` / `액티비티`

### 10.2 음식 / 술 (`food`)

11. 식당 선택은 `늘 먹던 맛집` vs `새로 생긴 곳`
12. 메뉴 주문은 `안전한 메뉴` vs `처음 보는 메뉴`
13. 한 끼 5만원 `좋으면 가능` vs `아깝다`
14. 술자리는 `시끄럽고 북적` vs `조용히 대화`
15. 술자리 `1차 길게` vs `2·3차 이동`
16. 매운 음식 `강한 맛 선호` vs `편한 맛 선호`
17. 디저트는 `식사 후 필수` vs `굳이 안 먹음`
18. 친구가 추천한 생소한 음식 `바로 도전` vs `후기 먼저 봄`
19. 메뉴 고를 때 `여럿이 여러 개 공유` vs `내 메뉴는 내 것`
20. 예약 어려운 인기 식당 `미리 예약` vs `그날 되는 곳`

### 10.3 여가 / 주말 (`leisure`)

21. 약속 없는 토요일 `집에서 쉰다` vs `밖으로 나간다`
22. 갑자기 친구가 "나와" `나간다` vs `오늘은 쉰다고 정함`
23. 취미는 `하나를 깊게` vs `여러 개 찍먹`
24. 새로운 취미 체험 `잘 못해도 해본다` vs `관심 확실해야 시작`
25. 쉬는 날 `사람 만나야 충전` vs `혼자 있어야 충전`
26. 영화 `익숙한 명작 재탕` vs `새 작품 탐색`
27. 콘서트·페스티벌 `사람 많아도 좋음` vs `피곤해서 선호 안 함`
28. 밤 11시 이후 `이제 시작` vs `집 갈 시간`
29. 친구 10명 모임 `재밌음` vs `3~4명이 좋음`
30. 주말 계획 `미리 캘린더` vs `당일 느낌`

### 10.4 소비 / 돈 (`spend`)

31. 돈을 쓴다면 `물건` vs `경험`
32. 같은 물건 `가성비 제품` vs `마음에 들면 프리미엄`
33. 택시 25분 vs 대중교통 55분 → `택시` vs `대중교통`
34. 옷 `적게 사도 좋은 것` vs `여러 벌 다양하게`
35. 여행에서 예산 20만원 초과 `경험 좋으면 괜찮음` vs `예산을 지킨다`
36. 새 전자기기 `초기에 써본다` vs `검증 후 산다`
37. 카페 한 잔 8천원 `공간 좋으면 가능` vs `아깝다`
38. 친구들과 비용 차이가 날 때 `좋은 옵션 맞춘다` vs `중간 가격으로 조정`
39. 할인 30%지만 덜 마음에 드는 상품 `산다` vs `원래 원한 걸 산다`
40. 기념일 `경험·분위기에 돈 쓴다` vs `실용적으로 한다`

### 10.5 관계 / 소셜 (`social`)

41. 친구 연락 `자주 짧게` vs `가끔 길게`
42. 좋은 일이 생기면 `바로 공유` vs `나중에 말함`
43. 고민이 생기면 `사람에게 말함` vs `혼자 정리`
44. 새로운 모임에서 `먼저 말 건다` vs `상대가 말 걸 때까지 기다림`
45. 친구 취향이 달라도 `같이 해본다` vs `각자 좋아하는 걸 한다`
46. 여행 중 의견이 갈리면 `같이 움직인다` vs `잠깐 따로 움직여도 됨`
47. 생일 `여럿이 축하` vs `친한 몇 명과 조용히`
48. 단톡방 `활발하게 참여` vs `필요할 때만`
49. 좋아하는 콘텐츠 `적극 추천` vs `물어보면 추천`
50. 친한 친구라도 `취향은 맞추는 편` vs `내 취향은 확실히 지킴`

### 10.6 생활 / 자극 / 리듬 (`life`)

51. 아침 `일찍 시작` vs `늦게까지 자는 게 좋음`
52. 방·책상 `정돈돼야 편함` vs `내가 찾을 수 있으면 됨`
53. 갑자기 일정이 바뀌면 `스트레스` vs `별 상관 없음`
54. 카페 `조용한 곳` vs `사람 구경 많은 곳`
55. 음악 `익숙한 플레이리스트` vs `새 음악 계속 탐색`
56. 운동 `루틴 반복` vs `새 운동·새 코스`
57. 하루가 비면 `해야 할 걸 정한다` vs `아무것도 안 정한다`
58. 옷 스타일 `내 스타일 반복` vs `새 스타일 시도`
59. 혼자 식사·영화 `아무 문제 없음` vs `누군가와 함께가 좋음`
60. 새로운 동네 `괜히 골목까지 돌아봄` vs `목적지만 다녀옴`

### 문항 작성 원칙 (추가 문항 만들 때)

- 추상적 자기평가("나는 외향적이다") ❌ → 구체적 장면("갑자기 빈 토요일이 생기면?") ⭕
- 사회적으로 바람직한 답이 명확한 문항 제외
- 같은 개념을 서로 다른 상황에서 반복 측정
- 유행성 강한 밈에만 의존하지 않기
- 베타에서 60문항이 짧으면 72개까지 늘릴 수 있게 예비 12문항 별도 관리

---

## 12. 개인정보 / 노출 정책

### 보여줄 수 있는 것 (Match 성립 시)

타입명, 6축 요약, SYNC 점수, 선택된 공통점/차이점 일부

### 기본 비공개

전체 60개 원문 응답, 성별, 연령대, 다른 사람과의 Match 리스트

### 규칙

- 초대 랜딩에서 초대자의 점수·응답을 **먼저 보여주지 않는다.** 본인이 완료해야 열림
- 공개 프로필 검색 기능 없음
- `invite_code`는 추측 불가 랜덤값
- Profile 삭제 시 응답 데이터 삭제 가능

### 성별 처리

- 개인 타입 산식에 **미사용**
- FRIEND SYNC 산식에 **미사용**
- 용도: 이용자 구성 분석, 문항 성별 DIF 점검, 익명 집계 콘텐츠
- "남자라서/여자라서 ~이다" 식 결과 문장 금지

---

## 13. 광고(AdSense) 배치 규칙

### 허용

- 개인 결과 페이지 하단
- FRIEND SYNC 결과 페이지 하단
- 친구 랭킹/추가 결과 영역 사이 (확장 시)

### 금지

- 랜딩 Hero 바로 아래 대형 광고
- 테스트 문항 사이 광고
- 결과 공개 직전 전면광고
- 비교 결과 열람 조건으로 광고 강제 시청

> 원칙: **사용자가 이미 보상을 받은 뒤** 노출한다. 광고로 재미가 깨지면 바이럴이 죽는다.

---

## 14. 개발 순서

### Sprint 0 — Prototype 검증 (문항 없이 가능)

문항을 한 개도 만들지 않고 Prototype 숫자만으로 돌릴 수 있다. **Sprint 1보다 먼저 한다.**
여기서 잡지 않으면 베타 30명 돌린 뒤에야 "루틴 애호가가 한 명도 안 나온다"를 발견하게 된다.

- [ ] 12개 Prototype Vector + 가중치 초안 작성
- [ ] `scripts/inspect-prototypes.ts` — 12×12 가중 거리 행렬 출력
- [ ] `scripts/simulate-types.ts` — 가상 사용자 10,000명 생성 후 타입 분포 히스토그램

**조정 기준**

| 증상 | 의미 | 조치 |
| --- | --- | --- |
| 두 Prototype 거리가 10 미만 | 사실상 같은 타입. 사용자에겐 랜덤으로 갈리는 것처럼 보임 | 한쪽을 다른 방향으로 밀거나 통합 |
| 특정 타입 출현율 0% | 다른 타입에 완전히 가려짐 | 좌표 이동 또는 제거 |
| 특정 타입 출현율 30% 초과 | 흡수력이 과도함 | 가중치·좌표 조정 |
| 12타입이 `novelty↑ spend↑` 영역에 몰림 | 공간 편중 | 반대 영역 타입 보강 |

> 가상 사용자는 균등난수보다 **각 축 평균 50 / 표준편차 18 정도의 정규분포**가 실제 응답 분포에 가깝다.
> 파일럿 응답이 생기면 그걸로 다시 돌린다.

**완료 기준:** 12개 타입이 모두 유의미한 비율로 출현하고, 서로 구분 가능한 거리를 갖는다.

### Sprint 1 — 테스트가 끝까지 돌아간다

- [ ] Landing
- [ ] Profile Setup (닉네임/성별/연령대)
- [ ] 질문 JSON/DB 구성 + seed
- [ ] Question UI (binary/quad, 자동 진행, 뒤로가기)
- [ ] **localStorage 응답 버퍼** (새로고침해도 진행 유지)
- [ ] `POST /api/test/submit` — 응답 저장 + 서버 채점
- [ ] `lib/scoring/v1/` 순수 함수 + 유닛 테스트
- [ ] 6축 점수 계산
- [ ] Prototype 기반 타입 판정
- [ ] 개인 결과 화면 (막대 + Insight 룰)
- [ ] `scripts/recompute.ts` — responses 기준 전체 재채점 스크립트

**완료 기준:** 혼자 들어와 테스트하고 자기 타입을 볼 수 있다.

### Sprint 2 — 친구에게 퍼진다

- [ ] Invite code 생성
- [ ] Invite landing (`/i/[inviteCode]`)
- [ ] 초대받은 사람 **독립 Profile** 생성
- [ ] Match 생성
- [ ] FRIEND SYNC 계산 (전체 + 카테고리별)
- [ ] 공통점/차이점 추출 로직
- [ ] SYNC 결과 페이지
- [ ] 링크 복사
- [ ] 공유용 OG 이미지 — **matchId/profileId 기준 캐싱 필수, 요청마다 재생성 금지**

**완료 기준:** A가 B에게 보내고, B가 테스트한 뒤 둘의 SYNC 결과를 본다.

### Sprint 3 — 다시 들어올 이유

- [ ] `anonymous_token` 발급/저장
- [ ] 기존 Profile 재사용 (재응답 없이 Match만 생성)
- [ ] 선택적 로그인 (소셜 1개)
- [ ] 내 결과 다시 보기
- [ ] 내가 비교한 친구 목록
- [ ] 결과 삭제

**완료 기준:** B가 C 링크를 받아도 재응답 없이 즉시 비교 가능.

### Sprint 4 — 베타 데이터 수집

- [ ] Analytics event 전체 연동
- [ ] 질문별 응답률 집계
- [ ] 이탈 문항 확인
- [ ] 질문 순서 랜덤화 / 블록 랜덤화
- [ ] 관리자용 최소 데이터 조회

### 코딩 전에 잠가야 할 것 (기획 TODO)

- [ ] 60문항 ↔ 6축 매핑
- [ ] 문항별 `scoring_key` 작성
- [ ] 12개 Prototype Vector + **축별 가중치** 초안 (Sprint 0에서 검증)
- [ ] 타입별 설명 문장 3~5개
- [ ] 2축 조합 Insight Rule
- [ ] 결과/공유 카드 와이어프레임
- [ ] 최종 서비스명 (SYNC는 작업명)

---

## 15. Analytics 이벤트

```
landing_view          start_test            profile_created
question_answered     question_back
test_25_complete      test_50_complete      test_75_complete
test_complete         personal_result_view
share_click           share_link_created
invite_opened         invite_test_started   invite_test_completed
sync_result_view      sync_share_click
save_profile_click    login_complete
```

### 핵심 KPI

| 지표 | 계산 |
| --- | --- |
| Activation | `test_complete / start_test` |
| 결과 만족 대리지표 | `share_click / personal_result_view` |
| Viral conversion | `invite_test_completed / invite_opened` |
| Viral coefficient | 1인당 평균 링크 발송 수 × 완료율 |
| 재사용률 | 기존 Profile이 새 Invite에서 재활용되는 비율 |

---

## 16. 통계 고도화 로드맵 (구현은 나중, 구조만 대비)

| Stage | 시점 | 할 일 |
| --- | --- | --- |
| 0 | 출시 전 | 문항-축 가설 지정, 역방향 문항, 지인 30~50명 파일럿 |
| 1 | N 300~500 | 응답비율 확인, 95:5 편향 문항 제거, 문항-축 상관, 내부일관성 |
| 2 | N 1,000+ | EFA로 6축 검증, 교차적재 문항 제거, 60→40~50문항 축소 검토 |
| 3 | N 5,000+ | 군집분석/LPA → 12타입 통폐합, Prototype 갱신 |
| 4 | — | 홀드아웃 검증, 재검사 안정성, SYNC 체감값 대조 |

**설계 함의:** `questions.version`, `responses.test_version`, `matches.scoring_version`을
반드시 채워서 저장할 것. 나중에 문항·산식이 바뀌어도 과거 데이터를 분리 분석할 수 있어야 한다.

---

## 17. 향후 확장 (지금 구현 금지)

1. **LOVE SYNC** — 기존 응답 재사용 + 관계문항 15~20개 추가. 비교영역: 연락 빈도 / 애정표현 / 데이트 활동성 / 개인시간 / 소비관 / 갈등 해결속도 / 약속·계획 / 사회적 관계
   - ⚠️ 관계 성공 가능성을 예측한다고 표현하지 않는다. "잘 맞는다/헤어져라"가 아니라 **선호 차이를 보여주는 대화 도구**
2. **친구 랭킹** — MY SYNC RANKING (새 친구를 계속 초대할 이유)
3. **그룹** — 5~10명 전체 쌍 Match 계산
4. **익명 집단 통계 콘텐츠** — "혼자 영화 가능한 사람은 몇 %?" 등
5. **BM 확장** — 광고 제거 유료 기능, 상세 리포트, 브랜드 협업

---

## 18. 에이전트 작업 규칙 (중요)

이 프로젝트는 대부분을 AI 에이전트가 작성한다. 아래는 "쉬운 길"로 갔을 때 나중에 되돌리기 비싼 지점들이다.

### 18.1 절대 하지 말 것

| 금지 | 왜 |
| --- | --- |
| 브라우저에서 DB 직접 호출 | `responses` 테이블이 새면 §12 정책 전체가 무너짐. 튜토리얼 기본 패턴이라 특히 주의 |
| 클라이언트에서 축 점수·타입·SYNC 계산 | §6.1 |
| 클라가 계산한 점수를 POST해서 저장 | 위조 가능 |
| 12개 타입·Insight 문장을 JSX/컴포넌트 안에 하드코딩 | 데이터로 분리해야 나중에 교체 가능 |
| 문항 텍스트를 컴포넌트에 하드코딩 | `questions` 테이블이 단일 원본 |
| `matches`에 상대 원본 응답 전체를 저장·반환 | §12 |
| 새 의존성 추가로 문제 해결 | 스택은 §1로 고정. 추가 전 반드시 확인 |

### 18.2 정보가 없으면 지어내지 말고 물어볼 것

아직 확정되지 않은 값이 있다. 이걸 임의로 채우면 **테스트는 돌아가는데 결과가 의미 없는 상태**가 되고, 문제가 늦게 발견된다.

- 60문항 ↔ 6축 매핑
- 문항별 `scoring_key`
- 12개 Prototype Vector 수치 **및 축별 가중치**
- 타입별 설명 문장, Insight 룰 문장

이 값이 필요한 시점에는 **플레이스홀더를 만들지 말고 사용자에게 확인을 요청한다.**
임시로 진행해야 한다면 `// TODO: 확정 필요 — 임시값` 주석을 반드시 남기고, 임시값은 `lib/scoring/v1/` 안 한 파일에 모아둔다.

### 18.3 데이터가 원본, 파생값은 캐시

- **원본:** `responses`
- **캐시:** `profiles`의 6축 점수 / `main_type_id` / `matches`의 계산 결과

산식이 바뀌면 캐시는 전부 버리고 다시 계산한다. 그래서 `scripts/recompute.ts`가 Sprint 1 항목에 있다.
`questions.version`, `responses.test_version`, `matches.scoring_version`은 **저장 시 반드시 채운다.** 비워두면 §16 로드맵이 통째로 막힌다.

### 18.4 스키마 변경은 사람에게 확인받기

UI·컴포넌트는 마음껏 고쳐도 되지만, **테이블 스키마와 API 응답 형태는 임의로 바꾸지 않는다.**
이미 응답 데이터가 쌓인 뒤의 마이그레이션이 이 프로젝트에서 가장 비싼 작업이다. 변경이 필요하면 이유와 함께 제안하고 승인을 받는다.

### 18.5 사람이 반드시 직접 읽어야 할 파일

바이브코딩이어도 아래는 눈으로 확인한다:

- `lib/scoring/v1/*` — 채점이 틀리면 제품 전체가 무의미
- `app/api/**/route.ts` — 권한 경계
- `DATABASE_URL`을 참조하는 모든 파일 — 연결 문자열이 클라로 새지 않았는지
- `db/migrations/*` — 스키마

나머지(화면, 스타일, 애니메이션)는 눈으로 보고 판단하면 되니까 위임해도 된다.

### 18.6 커밋 단위

Sprint 체크박스 하나 = 커밋 하나 정도로 쪼갠다. 되돌리기 쉬워야 과감하게 맡길 수 있다.

---

## 19. 개발 중 계속 지켜야 할 원칙

1. **혼자 해도 재밌어야 한다** — 친구 초대 없으면 아무것도 못 보는 구조 금지
2. **결과는 하나를 딱 찍는다** — "A 52%, B 48%"가 메인이 아니다
3. **하지만 한 유형에 우겨넣지 않는다** — 6개 연속형 막대로 개인차 표현
4. **궁합은 실제 응답에 근거한다** — 생일·이름·혈액형 랜덤 요소 금지
5. **카피는 논문처럼 쓰지 않는다** — 통계는 뒤에서, 앞에서는 친구가 읽고 웃게
6. **공유 결과는 설명 없이 이해돼야 한다** — `계획형 쾌락주의자 / SYNC 91% / 취향 쌍둥이` 캡처만으로 서비스가 보여야 함
7. **네트워크보다 Profile이 먼저다** — 누구 링크로 들어왔든 자기 Profile의 주인
8. **성별보다 실제 선택** — 인구통계는 분석용
9. **AI 없이 끝까지 돌아간다** — 규칙·통계·DB만으로 핵심 경험 완성
10. **초기 모델은 정답이 아니라 가설이다** — 문항·축·타입 교체가 쉬운 구조 유지
