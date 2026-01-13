import { Html } from '@react-three/drei';
import { useState, useEffect } from 'react';

interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
}

interface SpeechBubbleProps {
  show: boolean;
  message: string;
  position?: [number, number, number];
  npcName?: string;
  colorTheme?: ColorTheme;
  defaultGreeting?: string;
}

const DEFAULT_THEME: ColorTheme = {
  primary: '#4c1d95',
  secondary: '#8b5cf6',
  accent: '#ec4899',
};

export default function SpeechBubble({
  show,
  message,
  position = [0, 3.5, 0],
  npcName = 'NPC',
  colorTheme = DEFAULT_THEME,
  defaultGreeting = '안녕하세요! ✨',
}: SpeechBubbleProps) {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const greeting = message || defaultGreeting;
      setDisplayMessage(greeting);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [show, message, defaultGreeting]);

  if (!isVisible) return null;

  // RAG 응답인지 (긴 메시지) 확인
  const isLongMessage = displayMessage.length > 50;

  // 색상 헬퍼 함수
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div
        className="relative"
        style={{
          animation: 'bubblePop 0.3s ease-out',
        }}
      >
        {/* 말풍선 본체 */}
        <div
          className={`
            relative
            ${isLongMessage ? 'min-w-[280px] max-w-[360px]' : 'min-w-[180px] max-w-[280px]'}
            rounded-2xl
            overflow-hidden
          `}
          style={{
            background: `linear-gradient(135deg, ${colorTheme.primary} 0%, ${colorTheme.secondary} 100%)`,
            boxShadow: `0 8px 32px ${hexToRgba(colorTheme.secondary, 0.4)}, 0 0 0 1px rgba(255,255,255,0.1) inset`,
          }}
        >
          {/* 헤더 - NPC 이름 */}
          <div
            className="px-4 py-2 flex items-center gap-2"
            style={{
              background: `linear-gradient(90deg, ${hexToRgba(colorTheme.accent, 0.3)} 0%, ${hexToRgba(colorTheme.secondary, 0.3)} 100%)`,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${colorTheme.accent}, ${colorTheme.secondary})`,
              }}
            >
              <span className="text-xs">💬</span>
            </div>
            <span
              className="font-bold text-sm tracking-wide"
              style={{ color: colorTheme.accent }}
            >
              {npcName}
            </span>
          </div>

          {/* 메시지 내용 */}
          <div className="px-4 py-3">
            <p
              className={`
                text-gray-100
                ${isLongMessage ? 'text-sm leading-relaxed' : 'text-base leading-normal'}
                whitespace-pre-wrap
              `}
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                wordBreak: 'keep-all',
              }}
            >
              {displayMessage}
            </p>
          </div>

          {/* 하단 장식 */}
          <div
            className="h-1"
            style={{
              background: `linear-gradient(90deg, ${colorTheme.accent}, ${colorTheme.secondary}, ${colorTheme.primary})`,
            }}
          />
        </div>

        {/* 말풍선 꼬리 */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-3">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: `14px solid ${colorTheme.secondary}`,
              filter: `drop-shadow(0 4px 6px ${hexToRgba(colorTheme.secondary, 0.3)})`,
            }}
          />
        </div>

        {/* 반짝이 효과 */}
        <div
          className="absolute -top-1 -right-1 text-lg"
          style={{
            animation: 'sparkle 1.5s ease-in-out infinite',
          }}
        >
          ✨
        </div>
      </div>

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes bubblePop {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          50% {
            transform: scale(1.02) translateY(-2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.6;
            transform: scale(0.8) rotate(15deg);
          }
        }
      `}</style>
    </Html>
  );
}
