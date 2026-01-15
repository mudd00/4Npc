import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { sendMessageByLevelStream, startLevel3ConversationStream, startLevel4ConversationStream } from '../lib/api';
import type { ChatMessage, NPCLevel } from '../types';

export interface AffinityInfo {
  affinity: number;
  affinityLevel: string;
  affinityDelta?: number;
  levelChanged?: boolean;
  newLevel?: string;
  affinityReason?: string;
}

// 고유 ID 생성
let messageIdCounter = 0;
function generateMessageId(): string {
  return `${Date.now()}-${++messageIdCounter}`;
}

// 세션 동안 레벨별 메시지 저장소
const messagesByLevel: Record<number, ChatMessage[]> = {};
const affinityByLevel: Record<number, AffinityInfo | null> = {};

export function useChat(level: NPCLevel = 2) {
  // 레벨별로 저장된 메시지가 있으면 복원
  const [messages, setMessages] = useState<ChatMessage[]>(() => messagesByLevel[level] || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [affinityInfo, setAffinityInfo] = useState<AffinityInfo | null>(() => affinityByLevel[level] || null);
  const levelRef = useRef(level);
  const isSendingRef = useRef(false); // 중복 전송 방지

  // 레벨이 변경되면 해당 레벨의 메시지 복원
  useEffect(() => {
    levelRef.current = level;
    setMessages(messagesByLevel[level] || []);
    setAffinityInfo(affinityByLevel[level] || null);
  }, [level]);

  // 메시지가 변경되면 레벨별 저장소에 저장
  useEffect(() => {
    messagesByLevel[levelRef.current] = messages;
  }, [messages]);

  // 호감도 정보도 저장
  useEffect(() => {
    if (affinityInfo) {
      affinityByLevel[levelRef.current] = affinityInfo;
    }
  }, [affinityInfo]);

  const send = useCallback(async (content: string) => {
    // 중복 전송 방지 (ref 기반)
    if (!content.trim() || isLoading || isSendingRef.current) return;
    isSendingRef.current = true;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    const npcMessageId = generateMessageId();

    // 사용자 메시지와 빈 NPC 메시지 추가
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: npcMessageId,
        role: 'npc',
        content: '',
        timestamp: new Date(),
      },
    ]);
    setIsLoading(true);
    setError(null);

    try {
      // 스트리밍 API 호출
      await sendMessageByLevelStream(
        content,
        levelRef.current,
        // onChunk: 텍스트 청크가 올 때마다 메시지 업데이트
        (text) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === npcMessageId
                ? { ...msg, content: msg.content + text }
                : msg
            )
          );
        },
        // onDone: 완료
        () => {
          setIsLoading(false);
          isSendingRef.current = false;
        },
        // onError: 에러
        (err) => {
          setError('메시지 전송에 실패했습니다.');
          console.error('Chat error:', err);
          setIsLoading(false);
          isSendingRef.current = false;
        },
        // onAffinity: 호감도 실시간 업데이트
        (affinity) => {
          setAffinityInfo(affinity);
        }
      );
    } catch (err) {
      setError('메시지 전송에 실패했습니다.');
      console.error('Chat error:', err);
      setIsLoading(false);
      isSendingRef.current = false;
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setAffinityInfo(null);
    isSendingRef.current = false;
    // 저장소에서도 삭제
    messagesByLevel[levelRef.current] = [];
    affinityByLevel[levelRef.current] = null;
  }, []);

  // Level 3, 4 대화 시작 (NPC가 먼저 인사) - 스트리밍
  const startConversation = useCallback(async () => {
    const currentLevel = levelRef.current;
    if ((currentLevel !== 3 && currentLevel !== 4) || isLoading) return;

    const npcMessageId = generateMessageId();

    // 빈 NPC 메시지 추가
    setMessages([
      {
        id: npcMessageId,
        role: 'npc',
        content: '',
        timestamp: new Date(),
      },
    ]);
    setIsLoading(true);
    setError(null);

    try {
      if (currentLevel === 3) {
        // Level 3: Memory NPC
        await startLevel3ConversationStream(
          (text) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === npcMessageId
                  ? { ...msg, content: msg.content + text }
                  : msg
              )
            );
          },
          () => {
            setIsLoading(false);
          },
          (err) => {
            setError('대화 시작에 실패했습니다.');
            console.error('Start conversation error:', err);
            setIsLoading(false);
          }
        );
      } else {
        // Level 4: Personality NPC
        await startLevel4ConversationStream(
          (text) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === npcMessageId
                  ? { ...msg, content: msg.content + text }
                  : msg
              )
            );
          },
          (affinity) => {
            if (affinity) {
              setAffinityInfo(affinity);
            }
            setIsLoading(false);
          },
          (err) => {
            setError('대화 시작에 실패했습니다.');
            console.error('Start conversation error:', err);
            setIsLoading(false);
          }
        );
      }
    } catch (err) {
      setError('대화 시작에 실패했습니다.');
      console.error('Start conversation error:', err);
      setIsLoading(false);
    }
  }, [isLoading]);

  return {
    messages,
    isLoading,
    error,
    send,
    clearMessages,
    startConversation,
    affinityInfo,
  };
}
