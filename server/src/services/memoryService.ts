import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

// 대화 기록 저장
export async function saveConversation(
  userId: string,
  npcId: string,
  userMessage: string,
  assistantMessage: string
): Promise<boolean> {
  const messages = [
    { user_id: userId, npc_id: npcId, role: 'user', content: userMessage },
    { user_id: userId, npc_id: npcId, role: 'assistant', content: assistantMessage },
  ];

  const { error } = await supabase.from('conversations').insert(messages);

  if (error) {
    console.error('Save conversation error:', error);
    return false;
  }

  return true;
}

// 최근 대화 기록 조회
export async function getRecentConversations(
  userId: string,
  npcId: string,
  limit: number = 10
): Promise<ConversationMessage[]> {
  const { data, error } = await supabase.rpc('get_recent_conversations', {
    p_user_id: userId,
    p_npc_id: npcId,
    p_limit: limit,
  });

  if (error) {
    console.error('Get conversations error:', error);
    // Fallback: 직접 쿼리
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('conversations')
      .select('role, content, created_at')
      .eq('user_id', userId)
      .eq('npc_id', npcId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fallbackError) {
      console.error('Fallback query error:', fallbackError);
      return [];
    }

    // 시간순으로 정렬 (오래된 것부터)
    return (fallbackData || []).reverse() as ConversationMessage[];
  }

  // 시간순으로 정렬 (오래된 것부터)
  return (data || []).reverse() as ConversationMessage[];
}

// 대화 기록을 컨텍스트 문자열로 변환
export function formatConversationHistory(messages: ConversationMessage[]): string {
  if (messages.length === 0) {
    return '';
  }

  return messages
    .map((msg) => `${msg.role === 'user' ? '손님' : '해나'}: ${msg.content}`)
    .join('\n');
}

// 유저 요약 정보 조회
export async function getUserSummary(
  userId: string,
  npcId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_summaries')
    .select('summary')
    .eq('user_id', userId)
    .eq('npc_id', npcId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.summary;
}

// 유저 요약 정보 업데이트
export async function updateUserSummary(
  userId: string,
  npcId: string,
  summary: string
): Promise<boolean> {
  const { error } = await supabase.rpc('upsert_user_summary', {
    p_user_id: userId,
    p_npc_id: npcId,
    p_summary: summary,
  });

  if (error) {
    console.error('Update summary error:', error);
    // Fallback: upsert 직접 실행
    const { error: upsertError } = await supabase
      .from('user_summaries')
      .upsert(
        { user_id: userId, npc_id: npcId, summary, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,npc_id' }
      );

    if (upsertError) {
      console.error('Upsert fallback error:', upsertError);
      return false;
    }
  }

  return true;
}

// 메모리 초기화 (대화 기록 + 유저 요약 삭제)
export async function resetMemory(
  userId: string,
  npcId: string
): Promise<boolean> {
  // 대화 기록 삭제
  const { error: convError } = await supabase
    .from('conversations')
    .delete()
    .eq('user_id', userId)
    .eq('npc_id', npcId);

  if (convError) {
    console.error('Delete conversations error:', convError);
    return false;
  }

  // 유저 요약 삭제
  const { error: summaryError } = await supabase
    .from('user_summaries')
    .delete()
    .eq('user_id', userId)
    .eq('npc_id', npcId);

  if (summaryError) {
    console.error('Delete summary error:', summaryError);
    return false;
  }

  return true;
}
