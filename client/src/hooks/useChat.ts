import { useState, useCallback, useRef, useEffect } from 'react';
import { sendMessageByLevelStream, startLevel3ConversationStream } from '../lib/api';
import type { ChatMessage, NPCLevel } from '../types';

export function useChat(level: NPCLevel = 2) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const levelRef = useRef(level);

  // 레벨이 변경되면 ref 업데이트
  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  const send = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    const npcMessageId = (Date.now() + 1).toString();

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
        },
        // onError: 에러
        (err) => {
          setError('메시지 전송에 실패했습니다.');
          console.error('Chat error:', err);
          setIsLoading(false);
        }
      );
    } catch (err) {
      setError('메시지 전송에 실패했습니다.');
      console.error('Chat error:', err);
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Level 3 대화 시작 (NPC가 먼저 인사) - 스트리밍
  const startConversation = useCallback(async () => {
    if (levelRef.current !== 3 || isLoading) return;

    const npcMessageId = Date.now().toString();

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
      await startLevel3ConversationStream(
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
        },
        // onError: 에러
        (err) => {
          setError('대화 시작에 실패했습니다.');
          console.error('Start conversation error:', err);
          setIsLoading(false);
        }
      );
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
  };
}
