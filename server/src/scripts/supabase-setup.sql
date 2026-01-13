-- =============================================
-- Supabase pgvector Setup for NPC Level 2 RAG
-- =============================================
-- 이 SQL을 Supabase SQL Editor에서 실행하세요.

-- 1. pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 지식 문서 테이블 생성
CREATE TABLE IF NOT EXISTS knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,        -- 'history', 'location', 'npc', 'rumor'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),        -- OpenAI text-embedding-3-small 차원
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 벡터 검색 인덱스 생성
CREATE INDEX IF NOT EXISTS knowledge_embedding_idx
ON knowledge
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. 카테고리 인덱스
CREATE INDEX IF NOT EXISTS knowledge_category_idx ON knowledge(category);

-- 5. 유사도 검색 함수 (전체)
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  title TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge.id,
    knowledge.category,
    knowledge.title,
    knowledge.content,
    1 - (knowledge.embedding <=> query_embedding) AS similarity
  FROM knowledge
  WHERE 1 - (knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. 카테고리별 유사도 검색 함수
CREATE OR REPLACE FUNCTION match_knowledge_by_category(
  query_embedding VECTOR(1536),
  target_category TEXT,
  match_count INT DEFAULT 1
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  title TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge.id,
    knowledge.category,
    knowledge.title,
    knowledge.content,
    1 - (knowledge.embedding <=> query_embedding) AS similarity
  FROM knowledge
  WHERE knowledge.category = target_category
  ORDER BY knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 확인: 테이블 생성 확인
SELECT 'Setup complete!' as status;
