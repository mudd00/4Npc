import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface KnowledgeDocument {
  id: string;
  category: string;
  title: string;
  content: string;
  similarity?: number;
}

export interface KnowledgeInsert {
  category: string;
  title: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

// 유사 문서 검색
export async function search(
  queryEmbedding: number[],
  limit: number = 3,
  threshold: number = 0.7
): Promise<KnowledgeDocument[]> {
  const { data, error } = await supabase.rpc('match_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) {
    console.error('Vector search error:', error);
    return [];
  }

  return data || [];
}

// 카테고리별 검색
export async function searchByCategory(
  queryEmbedding: number[],
  category: string,
  limit: number = 1
): Promise<KnowledgeDocument[]> {
  const { data, error } = await supabase.rpc('match_knowledge_by_category', {
    query_embedding: queryEmbedding,
    target_category: category,
    match_count: limit,
  });

  if (error) {
    console.error('Category search error:', error);
    // Fallback: 일반 검색 후 카테고리 필터링
    const allDocs = await search(queryEmbedding, limit * 3);
    return allDocs.filter(doc => doc.category === category).slice(0, limit);
  }

  return data || [];
}

// 문서 삽입
export async function insert(doc: KnowledgeInsert): Promise<boolean> {
  const { error } = await supabase.from('knowledge').insert({
    category: doc.category,
    title: doc.title,
    content: doc.content,
    embedding: doc.embedding,
    metadata: doc.metadata || {},
  });

  if (error) {
    console.error('Insert error:', error);
    return false;
  }

  return true;
}

// 일괄 삽입
export async function insertBatch(docs: KnowledgeInsert[]): Promise<boolean> {
  const { error } = await supabase.from('knowledge').insert(
    docs.map((doc) => ({
      category: doc.category,
      title: doc.title,
      content: doc.content,
      embedding: doc.embedding,
      metadata: doc.metadata || {},
    }))
  );

  if (error) {
    console.error('Batch insert error:', error);
    return false;
  }

  return true;
}

// 모든 문서 삭제 (개발용)
export async function clearAll(): Promise<boolean> {
  const { error } = await supabase.from('knowledge').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Clear error:', error);
    return false;
  }

  return true;
}
