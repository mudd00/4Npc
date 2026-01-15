import { useState } from 'react';
import type { ChatMessage as ChatMessageType, NPCConfig } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  npcConfig?: NPCConfig | null;
  onFeedback?: (messageId: string, feedback: 'up' | 'down') => void;
}

// 시간 포맷팅 함수
function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatMessage({ message, npcConfig, onFeedback }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const isUser = message.role === 'user';
  const npcName = npcConfig?.name || 'NPC';
  const colorTheme = npcConfig?.colorTheme;

  // 복사 기능
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // 피드백 기능
  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    onFeedback?.(message.id, type);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {/* NPC 프로필 아이콘 */}
      {!isUser && (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0 shadow-md"
          style={{
            background: colorTheme
              ? `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.secondary})`
              : '#9333ea',
          }}
        >
          {npcName.charAt(0)}
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {/* NPC 이름 (버블 위에 표시) */}
        {!isUser && (
          <span className="text-xs text-gray-500 font-medium mb-1 ml-1">{npcName}</span>
        )}

        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser ? 'rounded-br-md' : 'rounded-bl-md'
          }`}
          style={
            isUser
              ? {
                  background: colorTheme
                    ? `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.secondary})`
                    : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                }
              : {
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  color: '#374151',
                }
          }
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* 하단 영역: 시간 + 액션 버튼 */}
        <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-400 px-1">
            {formatTime(message.timestamp)}
          </span>

          {/* NPC 메시지에만 액션 버튼 표시 */}
          {!isUser && message.content && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* 복사 버튼 */}
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                title="복사"
              >
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              {/* 피드백 버튼 */}
              <button
                onClick={() => handleFeedback('up')}
                className={`p-1.5 rounded-lg transition-all ${
                  feedback === 'up'
                    ? 'text-green-500 bg-green-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="좋아요"
              >
                <svg className="w-3.5 h-3.5" fill={feedback === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              <button
                onClick={() => handleFeedback('down')}
                className={`p-1.5 rounded-lg transition-all ${
                  feedback === 'down'
                    ? 'text-red-500 bg-red-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="싫어요"
              >
                <svg className="w-3.5 h-3.5" fill={feedback === 'down' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
