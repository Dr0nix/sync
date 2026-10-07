ALTER TABLE profiles ADD CONSTRAINT profiles_anonymous_token_key UNIQUE (anonymous_token);   -- 토큰당 프로필 1개
