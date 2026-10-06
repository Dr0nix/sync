-- 스펙 §5 데이터 모델. 컬럼·타입은 스펙 그대로이며 임의로 바꾸지 않는다.
-- 테이블 이름에 스키마를 붙이지 않는다. scripts/migrate.ts가 search_path를 DB_SCHEMA로 맞춘 뒤 실행한다.

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
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_no    INT NOT NULL DEFAULT 1,   -- 재응시 회차. profiles 점수는 최신 회차 기준 캐시
  question_id   UUID NOT NULL REFERENCES questions(id),
  answer        VARCHAR,
  numeric_value FLOAT NULL,
  test_version  INT,
  answered_at   TIMESTAMP DEFAULT now(),
  UNIQUE (profile_id, attempt_no, question_id)   -- 회차당 문항 응답 1건. profile_id 조회 인덱스 겸용
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
  profile_a_attempt INT NOT NULL,   -- 비교에 쓴 회차. 재채점 시 같은 응답으로 재현하기 위함
  profile_b_attempt INT NOT NULL,
  mode              VARCHAR,
  sync_score        FLOAT,
  category_scores   JSONB,
  matched_items     JSONB,
  mismatched_items  JSONB,
  scoring_version   INT,
  created_at        TIMESTAMP DEFAULT now()
);
