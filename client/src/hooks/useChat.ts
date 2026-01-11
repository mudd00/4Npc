import { useState, useCallback } from 'react';
import { sendMessage } from '../lib/api';
import { ChatMessage } from '../types';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const response = await sendMessage(content);
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
