-- 같은 두 사람·같은 회차의 매치는 1개만 둔다. 누가 초대했는지와 상관없이 id가 작은 쪽이 a다.
ALTER TABLE matches ALTER COLUMN profile_a_id SET NOT NULL;   -- NULL이면 유일 제약을 통과하므로
ALTER TABLE matches ALTER COLUMN profile_b_id SET NOT NULL;
ALTER TABLE matches ADD CONSTRAINT matches_pair_order_check CHECK (profile_a_id < profile_b_id);   -- 저장 순서 고정. 자기 자신과의 매치도 막는다
ALTER TABLE matches ADD CONSTRAINT matches_pair_attempt_key
  UNIQUE (profile_a_id, profile_b_id, profile_a_attempt, profile_b_attempt);
