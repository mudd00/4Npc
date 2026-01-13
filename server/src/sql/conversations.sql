-- Level 3: 대화 기록 테이블
-- Supabase SQL Editor에서 실행하세요

-- conversations 테이블 생성
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,              -- 유저 식별자
  npc_id TEXT NOT NULL,               -- NPC 식별자 (npc-level3)
  role TEXT NOT NULL,                 -- 'user' or 'assistant'
  content TEXT NOT NULL,              -- 메시지 내용
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (유저별, NPC별 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_conversations_user_npc
ON conversations(user_id, npc_id, created_at DESC);

-- 최근 대화 조회 함수
CREATE OR REPLACE FUNCTION get_recent_conversations(
  p_user_id TEXT,
  p_npc_id TEXT,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.role,
    c.content,
    c.created_at
  FROM conversations c
  WHERE c.user_id = p_user_id
    AND c.npc_id = p_npc_id
  ORDER BY c.created_at DESC
  LIMIT p_limit;
END;
$$;

-- 유저 정보 요약 테이블 (NPC가 기억하는 유저 정보)
CREATE TABLE IF NOT EXISTS user_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  npc_id TEXT NOT NULL,
  summary TEXT NOT NULL,              -- 유저에 대해 NPC가 기억하는 정보
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, npc_id)
);

-- 유저 요약 업데이트 함수 (upsert)
CREATE OR REPLACE FUNCTION upsert_user_summary(
  p_user_id TEXT,
  p_npc_id TEXT,
  p_summary TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_summaries (user_id, npc_id, summary, updated_at)
  VALUES (p_user_id, p_npc_id, p_summary, NOW())
  ON CONFLICT (user_id, npc_id)
  DO UPDATE SET summary = p_summary, updated_at = NOW();
END;
$$;
