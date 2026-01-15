import { useState, useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType, NPCConfig } from '../../types';
import ChatMessage from './ChatMessage';

interface AffinityInfo {
  affinity: number;
  affinityLevel: string;
  affinityDelta?: number;
  levelChanged?: boolean;
  newLevel?: string;
  affinityReason?: string;
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessageType[];
  onSend: (message: string) => void;
  isLoading: boolean;
  error: string | null;
  npcConfig: NPCConfig | null;
  affinityInfo?: AffinityInfo | null;
  onReset?: () => void;
}

// 호감도 레벨 한글 이름
const LEVEL_NAMES: Record<string, string> = {
  stranger: '경계',
  acquaintance: '보통',
  friend: '친밀',
  close_friend: '절친',
};

export default function ChatDialog({
  isOpen,
  onClose,
  messages,
  onSend,
  isLoading,
  error,
  npcConfig,
  affinityInfo,
  onReset,
}: ChatDialogProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 호감도 피드백 상태
  const [showDelta, setShowDelta] = useState(false);
  const [deltaValue, setDeltaValue] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [barFlash, setBarFlash] = useState<'up' | 'down' | null>(null);
  const prevAffinityRef = useRef<number | null>(null);

  // 디버그 모드 상태 (localStorage로 유지)
  const [debugMode, setDebugMode] = useState(() => {
    return localStorage.getItem('npc-debug-mode') === 'true';
  });
  const [lastReason, setLastReason] = useState('');

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

  // 호감도 변화 감지 및 피드백 표시
  useEffect(() => {
    if (!affinityInfo) return;

    const delta = affinityInfo.affinityDelta;

    // 분석 이유 저장 (디버그용)
    if (affinityInfo.affinityReason) {
      setLastReason(affinityInfo.affinityReason);
    }

    // 델타가 있고 0이 아닐 때만 애니메이션 표시
    if (delta !== undefined && delta !== 0) {
      setDeltaValue(delta);
      setShowDelta(true);
      setBarFlash(delta > 0 ? 'up' : 'down');

      // 2초 후 델타 표시 숨김
      const deltaTimer = setTimeout(() => setShowDelta(false), 2000);
      // 0.5초 후 바 플래시 숨김
      const flashTimer = setTimeout(() => setBarFlash(null), 500);

      // 레벨 변화 체크
      if (affinityInfo.levelChanged && affinityInfo.newLevel) {
        setNewLevelName(LEVEL_NAMES[affinityInfo.newLevel] || affinityInfo.newLevel);
        setShowLevelUp(true);
        // 3초 후 레벨업 토스트 숨김
        const levelTimer = setTimeout(() => setShowLevelUp(false), 3000);
        return () => {
          clearTimeout(deltaTimer);
          clearTimeout(flashTimer);
          clearTimeout(levelTimer);
        };
      }

      return () => {
        clearTimeout(deltaTimer);
        clearTimeout(flashTimer);
      };
    }

    prevAffinityRef.current = affinityInfo.affinity;
  }, [affinityInfo]);

  // 디버그 모드 토글
  const toggleDebugMode = () => {
    const newValue = !debugMode;
    setDebugMode(newValue);
    localStorage.setItem('npc-debug-mode', String(newValue));
  };

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
    // Enter는 form onSubmit이 처리하므로 여기선 줄바꿈만 막음
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // form submit 트리거
      const form = (e.target as HTMLElement).closest('form');
      if (form) {
        form.requestSubmit();
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
          {/* Level 4: 호감도 표시 */}
          {level === 4 && affinityInfo && (
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 relative">
              <span className="text-white/90 text-xs">호감도</span>
              <div className="flex items-center gap-1 relative">
                <div
                  className="w-16 h-2 bg-white/30 rounded-full overflow-hidden transition-all duration-200"
                  style={{
                    boxShadow: barFlash === 'up'
                      ? '0 0 8px 2px rgba(74, 222, 128, 0.8)'
                      : barFlash === 'down'
                        ? '0 0 8px 2px rgba(248, 113, 113, 0.8)'
                        : 'none',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${affinityInfo.affinity}%`,
                      background: barFlash === 'up'
                        ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                        : barFlash === 'down'
                          ? 'linear-gradient(90deg, #f87171, #ef4444)'
                          : 'white',
                    }}
                  />
                </div>
                <span className="text-white text-xs font-medium min-w-[2rem]">
                  {affinityInfo.affinity}
                </span>
                {/* 호감도 변화량 표시 */}
                {showDelta && deltaValue !== 0 && (
                  <span
                    className="absolute -top-5 right-0 text-xs font-bold animate-bounce"
                    style={{
                      color: deltaValue > 0 ? '#4ade80' : '#f87171',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {deltaValue > 0 ? `+${deltaValue}` : deltaValue}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            {/* 디버그 토글 (Level 4만) */}
            {level === 4 && (
              <button
                onClick={toggleDebugMode}
                className={`rounded-full p-2 transition-all duration-200 ${
                  debugMode
                    ? 'text-yellow-400 bg-yellow-400/20'
                    : 'text-white/60 hover:text-white hover:bg-white/20'
                }`}
                title={debugMode ? '디버그 모드 끄기' : '디버그 모드 켜기'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </button>
            )}
            {/* 리셋 버튼 (Level 3, 4만) */}
            {level >= 3 && onReset && (
              <button
                onClick={onReset}
                className="text-white/60 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                title="관계 초기화"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 레벨 변화 토스트 */}
        {showLevelUp && (
          <div
            className="mx-4 mt-2 px-4 py-3 rounded-xl text-center animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
            }}
          >
            <span className="text-white font-bold text-sm">
              ✨ 관계가 '{newLevelName}'(으)로 발전했습니다! ✨
            </span>
          </div>
        )}

        {/* 디버그 정보 패널 (Level 4, 디버그 모드 활성화 시) */}
        {debugMode && level === 4 && affinityInfo && (
          <div
            className="mx-4 mt-2 px-3 py-2 rounded-lg text-xs"
            style={{
              background: 'rgba(250, 204, 21, 0.1)',
              border: '1px solid rgba(250, 204, 21, 0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-yellow-400 font-bold">DEBUG</span>
              <span className="text-gray-400">호감도 분석 결과</span>
            </div>
            <div className="text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>현재 점수:</span>
                <span className="text-white font-mono">{affinityInfo.affinity}</span>
              </div>
              <div className="flex justify-between">
                <span>단계:</span>
                <span className="text-white">{affinityInfo.affinityLevel}</span>
              </div>
              {lastReason && (
                <div className="mt-2 pt-2 border-t border-yellow-400/20">
                  <span className="text-yellow-400">마지막 분석:</span>
                  <p className="text-white mt-1">{lastReason}</p>
                </div>
              )}
            </div>
          </div>
        )}

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
          {messages
            .filter((msg) => msg.role === 'user' || msg.content !== '')
            .map((msg) => (
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
