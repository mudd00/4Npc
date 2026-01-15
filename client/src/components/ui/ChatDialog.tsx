import { useState, useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType, NPCConfig } from '../../types';
import ChatMessage from './ChatMessage';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessageType[];
  onSend: (message: string) => void;
  isLoading: boolean;
  error: string | null;
  npcConfig: NPCConfig | null;
}

export default function ChatDialog({
  isOpen,
  onClose,
  messages,
  onSend,
  isLoading,
  error,
  npcConfig,
}: ChatDialogProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // textarea 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  // Enter로 전송, Shift+Enter로 줄바꿈
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend(input);
        setInput('');
      }
    }
  };

  if (!isOpen || !npcConfig) return null;

  const { name, role, level, colorTheme } = npcConfig;

  // 마지막 NPC 메시지가 비어있으면 로딩 인디케이터 표시 (첫 청크 대기 중)
  const lastMessage = messages[messages.length - 1];
  const showTypingIndicator = isLoading && (!lastMessage || lastMessage.role === 'user' || lastMessage.content === '');

  // 퀵 리플라이 - NPC 레벨별 추천 질문
  const getQuickReplies = (): string[] => {
    // 대화가 진행 중이면 일반적인 퀵 리플라이
    if (messages.length > 0) {
      return ['더 자세히 알려줘', '다른 이야기 해줘', '고마워!'];
    }

    // 첫 대화 시 레벨별 퀵 리플라이
    switch (level) {
      case 1: // 밤이 - 경비원
        return ['안녕하세요', '마을은 안전한가요?', '오늘 밤 어떠세요?'];
      case 2: // 루나 - 안내원
        return ['마을 소개해줘', '가볼만한 곳은?', '재미있는 소문 있어?'];
      case 3: // 해나 - 상인
        return ['안녕하세요!', '뭐 팔아요?', '추천 상품 있어요?'];
      case 4: // 별이 - 점술가
        return ['오늘 운세 봐줘', '별자리 이야기 해줘', '미래가 궁금해요'];
      default:
        return ['안녕하세요', '이야기 해줘', '도움이 필요해요'];
    }
  };

  const quickReplies = getQuickReplies();
  const showQuickReplies = !isLoading && messages.length <= 2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${colorTheme.primary}40 0%, ${colorTheme.secondary}40 100%)`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="w-full max-w-md mx-4 flex flex-col max-h-[85vh] rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            background: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.secondary})`,
          }}
        >
          <div className="flex items-center gap-3">
            {/* NPC 아바타 */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {name.charAt(0)}
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">{name}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-white/80 text-sm">{role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[300px]"
          style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
        >
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${colorTheme.primary}20, ${colorTheme.secondary}20)`,
                }}
              >
                💬
              </div>
              <p className="text-gray-500 font-medium">{name}에게 말을 걸어보세요!</p>
              <p className="text-gray-400 text-sm mt-1">아래 버튼을 눌러 대화를 시작하세요</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} npcConfig={npcConfig} />
          ))}
          {/* 타이핑 인디케이터 */}
          {showTypingIndicator && (
            <div className="flex items-start">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0 shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.secondary})`,
                }}
              >
                {name.charAt(0)}
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm"
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="text-center bg-red-50 text-red-600 text-sm py-3 px-4 rounded-xl">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4"
          style={{
            background: 'white',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          {/* 퀵 리플라이 버튼 */}
          {showQuickReplies && (
            <div className="flex flex-wrap gap-2 mb-3">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSend(reply)}
                  className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${colorTheme.primary}15, ${colorTheme.secondary}15)`,
                    color: colorTheme.primary,
                    border: `1px solid ${colorTheme.primary}30`,
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div
              className="flex-1 rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요..."
                className="w-full px-4 py-3 bg-transparent focus:outline-none resize-none min-h-[44px] max-h-[120px] text-gray-700 placeholder-gray-400"
                disabled={isLoading}
                rows={1}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg active:scale-95 flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.secondary})`,
                boxShadow: `0 4px 14px ${colorTheme.primary}40`,
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Enter 전송 · Shift+Enter 줄바꿈 · ESC 닫기
          </p>
        </form>
      </div>
    </div>
  );
}
