-- Level 4: 호감도 시스템 테이블
-- Supabase SQL Editor에서 실행하세요

-- user_affinity 테이블 생성
CREATE TABLE IF NOT EXISTS user_affinity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,              -- 유저 식별자
  npc_id TEXT NOT NULL,               -- NPC 식별자 (npc-level4)
  affinity_score INT DEFAULT 0,       -- 호감도 점수 (0~100, 시작값 0)
  total_conversations INT DEFAULT 0,  -- 총 대화 횟수
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, npc_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_affinity_user_npc
ON user_affinity(user_id, npc_id);

-- 호감도 조회 함수
CREATE OR REPLACE FUNCTION get_user_affinity(
  p_user_id TEXT,
  p_npc_id TEXT
)
RETURNS TABLE (
  affinity_score INT,
  total_conversations INT,
  last_interaction TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ua.affinity_score,
    ua.total_conversations,
    ua.last_interaction
  FROM user_affinity ua
  WHERE ua.user_id = p_user_id
    AND ua.npc_id = p_npc_id;
END;
$$;

-- 호감도 업데이트 함수 (upsert)
CREATE OR REPLACE FUNCTION update_user_affinity(
  p_user_id TEXT,
  p_npc_id TEXT,
  p_delta_score INT  -- 증감할 점수 (+/-)
)
RETURNS INT  -- 업데이트된 호감도 반환
LANGUAGE plpgsql
AS $$
DECLARE
  new_score INT;
BEGIN
  INSERT INTO user_affinity (user_id, npc_id, affinity_score, total_conversations, last_interaction)
  VALUES (p_user_id, p_npc_id, GREATEST(0, LEAST(100, p_delta_score)), 1, NOW())
  ON CONFLICT (user_id, npc_id)
  DO UPDATE SET
    affinity_score = GREATEST(0, LEAST(100, user_affinity.affinity_score + p_delta_score)),
    total_conversations = user_affinity.total_conversations + 1,
    last_interaction = NOW()
  RETURNING user_affinity.affinity_score INTO new_score;

  RETURN new_score;
END;
$$;
