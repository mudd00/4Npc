import { useEffect, useCallback, useMemo } from 'react';
import type { InfoCategory } from '../../lib/api';
import type { NPCConfig, NPCLevel } from '../../types';

interface MenuOption {
  key: string;
  label: string;
  action: 'chat' | 'info';
  category?: InfoCategory;
}

// 레벨별 메뉴 옵션
const MENU_OPTIONS_BY_LEVEL: Record<NPCLevel, MenuOption[]> = {
  1: [
    { key: '1', label: '대화하기', action: 'chat' },
  ],
  2: [
    { key: '1', label: '대화하기', action: 'chat' },
    { key: '2', label: '마을에 대해 알려줘', action: 'info', category: 'history' },
    { key: '3', label: '추천 장소가 있어?', action: 'info', category: 'location' },
    { key: '4', label: '소문 들은 거 있어?', action: 'info', category: 'rumor' },
  ],
  3: [
    { key: '1', label: '대화하기', action: 'chat' },
  ],
  4: [
    { key: '1', label: '대화하기', action: 'chat' },
  ],
};

// 레벨별 설명
const LEVEL_DESCRIPTIONS: Record<NPCLevel, string> = {
  1: '기본 대화 (기억 없음)',
  2: 'RAG 기반 지식 대화',
  3: '대화 기억 시스템',
  4: '호감도 & 감정 시스템',
};

interface InteractionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: () => void;
  onSelectInfo: (category: InfoCategory) => void;
  isLoading?: boolean;
  npcConfig: NPCConfig | null;
}

export default function InteractionMenu({
  isOpen,
  onClose,
  onSelectChat,
  onSelectInfo,
  isLoading = false,
  npcConfig,
}: InteractionMenuProps) {
  // 현재 NPC 레벨에 맞는 메뉴 옵션
  const menuOptions = useMemo(() => {
    if (!npcConfig) return MENU_OPTIONS_BY_LEVEL[1];
    return MENU_OPTIONS_BY_LEVEL[npcConfig.level];
  }, [npcConfig]);

  const handleSelect = useCallback((option: MenuOption) => {
    if (isLoading) return;

    if (option.action === 'chat') {
      onSelectChat();
    } else if (option.action === 'info' && option.category) {
      onSelectInfo(option.category);
    }
  }, [onSelectChat, onSelectInfo, isLoading]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      const option = menuOptions.find(opt => opt.key === e.key);
      if (option) {
        handleSelect(option);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleSelect, menuOptions]);

  if (!isOpen || !npcConfig) return null;

  const { name, role, level, colorTheme } = npcConfig;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="bg-slate-900/95 rounded-xl shadow-2xl border border-slate-700 overflow-hidden pointer-events-auto min-w-[300px]">
        {/* Header */}
        <div
          className="px-4 py-3"
          style={{
            background: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.secondary})`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold">{name}</h2>
              <p className="text-white/70 text-xs">{role}</p>
            </div>
            <div
              className="px-2 py-1 rounded text-xs font-bold"
              style={{
                background: colorTheme.accent,
                color: colorTheme.primary,
              }}
            >
              Lv.{level}
            </div>
          </div>
          <p className="text-white/60 text-xs mt-1">{LEVEL_DESCRIPTIONS[level]}</p>
        </div>

        {/* Options */}
        <div className="p-2">
          {menuOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => handleSelect(option)}
              disabled={isLoading}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-150
                ${isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-slate-700/50 active:bg-slate-600/50'
                }
              `}
            >
              <span className="
                w-6 h-6 flex items-center justify-center
                bg-purple-500 text-white text-sm font-bold rounded
              ">
                {option.key}
              </span>
              <span className="text-slate-200">{option.label}</span>
              {option.action === 'chat' && (
                <span className="ml-auto text-xs text-purple-400">심화대화</span>
              )}
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-slate-700 my-2" />

          {/* Close */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-slate-400 hover:text-slate-200 hover:bg-slate-700/30
              transition-all duration-150
            "
          >
            <span className="
              w-6 h-6 flex items-center justify-center
              bg-slate-600 text-slate-300 text-xs font-bold rounded
            ">
              ESC
            </span>
            <span>떠나기</span>
          </button>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>응답 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
