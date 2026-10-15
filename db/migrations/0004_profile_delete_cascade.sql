-- 프로필을 지우면 그 사람의 초대코드와, 그 사람이 낀 매치도 함께 지운다(스펙 §12 결과 삭제).
-- responses는 0001에서 이미 ON DELETE CASCADE다.
ALTER TABLE invites
  DROP CONSTRAINT invites_inviter_profile_id_fkey,
  ADD CONSTRAINT invites_inviter_profile_id_fkey
    FOREIGN KEY (inviter_profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE matches
  DROP CONSTRAINT matches_profile_a_id_fkey,
  ADD CONSTRAINT matches_profile_a_id_fkey
    FOREIGN KEY (profile_a_id) REFERENCES profiles(id) ON DELETE CASCADE,
  DROP CONSTRAINT matches_profile_b_id_fkey,
  ADD CONSTRAINT matches_profile_b_id_fkey
    FOREIGN KEY (profile_b_id) REFERENCES profiles(id) ON DELETE CASCADE;
