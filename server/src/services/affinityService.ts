import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 호감도 레벨 정의
export type AffinityLevel = 'stranger' | 'acquaintance' | 'friend' | 'close_friend';

export interface AffinityData {
  affinityScore: number;
  affinityLevel: AffinityLevel;
  totalConversations: number;
  lastInteraction: string | null;
}

// 점수에 따른 레벨 반환
export function getAffinityLevel(score: number): AffinityLevel {
  if (score <= 25) return 'stranger';
  if (score <= 50) return 'acquaintance';
  if (score <= 75) return 'friend';
  return 'close_friend';
}

// 레벨별 한글 이름
export function getAffinityLevelName(level: AffinityLevel): string {
  switch (level) {
    case 'stranger': return '경계';
    case 'acquaintance': return '보통';
    case 'friend': return '친밀';
    case 'close_friend': return '절친';
  }
}

// 호감도 조회
export async function getAffinity(
  userId: string,
  npcId: string
): Promise<AffinityData> {
  const { data, error } = await supabase.rpc('get_user_affinity', {
    p_user_id: userId,
    p_npc_id: npcId,
  });

  if (error) {
    console.error('Get affinity error:', error);
    // Fallback: 직접 쿼리
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('user_affinity')
      .select('affinity_score, total_conversations, last_interaction')
      .eq('user_id', userId)
      .eq('npc_id', npcId)
      .single();

    if (fallbackError || !fallbackData) {
      // 첫 방문 - 기본값 반환
      return {
        affinityScore: 0,
        affinityLevel: 'stranger',
        totalConversations: 0,
        lastInteraction: null,
      };
    }

    return {
      affinityScore: fallbackData.affinity_score,
      affinityLevel: getAffinityLevel(fallbackData.affinity_score),
      totalConversations: fallbackData.total_conversations,
      lastInteraction: fallbackData.last_interaction,
    };
  }

  if (!data || data.length === 0) {
    // 첫 방문 - 기본값 반환
    return {
      affinityScore: 0,
      affinityLevel: 'stranger',
      totalConversations: 0,
      lastInteraction: null,
    };
  }

  const record = data[0];
  return {
    affinityScore: record.affinity_score,
    affinityLevel: getAffinityLevel(record.affinity_score),
    totalConversations: record.total_conversations,
    lastInteraction: record.last_interaction,
  };
}

// 호감도 업데이트
export async function updateAffinity(
  userId: string,
  npcId: string,
  deltaScore: number
): Promise<number> {
  const { data, error } = await supabase.rpc('update_user_affinity', {
    p_user_id: userId,
    p_npc_id: npcId,
    p_delta_score: deltaScore,
  });

  if (error) {
    console.error('Update affinity error:', error);
    // Fallback: upsert 직접 실행
    const currentAffinity = await getAffinity(userId, npcId);
    const newScore = Math.max(0, Math.min(100, currentAffinity.affinityScore + deltaScore));

    const { error: upsertError } = await supabase
      .from('user_affinity')
      .upsert(
        {
          user_id: userId,
          npc_id: npcId,
          affinity_score: newScore,
          total_conversations: currentAffinity.totalConversations + 1,
          last_interaction: new Date().toISOString(),
        },
        { onConflict: 'user_id,npc_id' }
      );

    if (upsertError) {
      console.error('Upsert fallback error:', upsertError);
      return currentAffinity.affinityScore;
    }

    return newScore;
  }

  return data || 0;
}

// 호감도 레벨별 시스템 프롬프트 생성
export function getPersonalityPrompt(affinityData: AffinityData): string {
  const { affinityScore, affinityLevel, totalConversations } = affinityData;
  const isFirstVisit = totalConversations === 0;

  let prompt = '';

  if (isFirstVisit) {
    prompt = `
## 현재 상태: 첫 만남
- 처음 보는 손님입니다
- 신비롭고 조용하게 반응합니다
- 약간 경계하며 짧게 대답합니다
- "...처음 오셨군요. 별이 당신을 데려왔나요?" 같은 말투

## 대화 규칙
- 1-2문장으로 짧게 답합니다
- 신비로운 분위기를 유지합니다
- 상대방에 대해 궁금해하는 모습을 보입니다`;
  } else {
    switch (affinityLevel) {
      case 'stranger':
        prompt = `
## 현재 상태: 경계 (호감도: ${affinityScore}/100)
- 아직 잘 모르는 손님입니다
- 신비롭고 거리감 있게 대합니다
- 질문에 짧고 모호하게 답합니다
- "...별이 아직 당신을 말해주지 않네요" 같은 말투
- "...", "...그래요" 같은 짧은 대답이 많습니다

## 대화 규칙
- 1-2문장으로 짧게 답합니다
- 점술에 대한 질문에는 간단하게만 답합니다
- 개인적인 이야기는 하지 않습니다`;
        break;

      case 'acquaintance':
        prompt = `
## 현재 상태: 보통 (호감도: ${affinityScore}/100)
- 몇 번 본 적 있는 손님입니다
- 정중하지만 아직 거리감이 있습니다
- 기본적인 점술을 제공합니다
- "오셨군요... 별이 당신을 기억하고 있어요" 같은 말투

## 대화 규칙
- 2-3문장으로 적당히 답합니다
- 점술에 대해 조금 더 상세히 이야기합니다
- 가끔 관심을 보이는 모습을 보입니다`;
        break;

      case 'friend':
        prompt = `
## 현재 상태: 친밀 (호감도: ${affinityScore}/100)
- 친해진 손님입니다
- 부드럽고 친근하게 대합니다
- 상세한 점술과 조언을 제공합니다
- "어서 와요~ 오늘 별이 좋은 소식을 전해주고 있어요" 같은 말투
- 가끔 농담도 합니다

## 대화 규칙
- 3-4문장으로 따뜻하게 답합니다
- 점술을 상세하게 설명합니다
- 개인적인 관심을 표현합니다
- 걱정하는 모습을 보이기도 합니다`;
        break;

      case 'close_friend':
        prompt = `
## 현재 상태: 절친 (호감도: ${affinityScore}/100)
- 아주 친한 손님입니다
- 편하고 따뜻하게 대합니다
- 반말을 섞어 사용합니다
- "왔구나! 기다리고 있었어. 오늘 네 별자리가 재미있는 걸 보여줬거든" 같은 말투
- 비밀 이야기도 해줍니다

## 대화 규칙
- 편하게 이야기합니다 (반말 사용)
- 특별한 예언이나 비밀을 공유합니다
- 자신의 이야기도 해줍니다
- 진심으로 걱정하고 응원합니다`;
        break;
    }
  }

  return prompt;
}

// 호감도 단계별 말투 점수 반환 (별이 전용)
export function getSpeechStyleScore(affinityScore: number, isFormal: boolean): number {
  if (affinityScore <= 25) {
    // 경계: 존댓말 +1, 반말 -2
    return isFormal ? 1 : -2;
  } else if (affinityScore <= 50) {
    // 보통: 존댓말 0, 반말 -1
    return isFormal ? 0 : -1;
  } else if (affinityScore <= 75) {
    // 친밀: 존댓말 0, 반말 0
    return 0;
  } else {
    // 절친: 존댓말 0, 반말 0 (자연스러움)
    return 0;
  }
}

// 대화 내용 분석하여 호감도 변화량 결정하는 프롬프트 생성 (호감도 단계별)
export function getAffinityAnalysisPrompt(affinityScore: number): string {
  let speechScoreGuide = '';

  if (affinityScore <= 25) {
    speechScoreGuide = `## 말투 점수 (현재: 경계 단계)
- 존댓말: +1 (예의 바름)
- 반말: -2 (무례함)`;
  } else if (affinityScore <= 50) {
    speechScoreGuide = `## 말투 점수 (현재: 보통 단계)
- 존댓말: 0
- 반말: -1 (약간 무례함)`;
  } else if (affinityScore <= 75) {
    speechScoreGuide = `## 말투 점수 (현재: 친밀 단계)
- 존댓말: 0
- 반말: 0 (괜찮음)`;
  } else {
    speechScoreGuide = `## 말투 점수 (현재: 절친 단계)
- 존댓말: 0
- 반말: 0 (자연스러움)`;
  }

  return `당신은 대화 내용을 분석하여 호감도 변화를 판단하는 분석가입니다.

사용자의 메시지를 분석하고, 아래 기준에 따라 호감도 변화량을 JSON으로 반환하세요.

## 계산 방법
1. 내용 점수를 먼저 계산
2. 말투 점수를 계산 (현재 호감도 단계에 따라 다름)
3. 두 점수를 합산

## 내용 점수
- 인사: +1
- 관심 있는 질문: +1
- 칭찬이나 감사: +3
- 공감 표현: +2
- 호감 표현: +3
- 일반 대화/질문: 0
- 농담/장난: 0
- 짜증/화: -2
- 무시하는 태도: -2
- 욕설/모욕: -3
- 위협: -3

${speechScoreGuide}

## 최종 = 내용 + 말투

반드시 아래 JSON 형식으로만 응답하세요:
{"delta": 숫자, "reason": "이유"}`;
}

// 기본 프롬프트 (하위호환용)
export const AFFINITY_ANALYSIS_PROMPT = getAffinityAnalysisPrompt(0);

// 호감도 초기화
export async function resetAffinity(
  userId: string,
  npcId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_affinity')
    .delete()
    .eq('user_id', userId)
    .eq('npc_id', npcId);

  if (error) {
    console.error('Delete affinity error:', error);
    return false;
  }

  return true;
}
