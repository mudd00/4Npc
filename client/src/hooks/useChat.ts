import { useState, useCallback, useRef, useEffect } from 'react';
import { sendMessageByLevel } from '../lib/api';
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

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // 현재 레벨에 맞는 API 호출
      const response = await sendMessageByLevel(content, levelRef.current);
      const npcMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'npc',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, npcMessage]);
    } catch (err) {
      setError('메시지 전송에 실패했습니다.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    send,
    clearMessages,
  };
}
