import { useState, useEffect, useCallback } from 'react';
import Scene from './three/Scene';
import ChatDialog from './ui/ChatDialog';
import InteractionPrompt from './ui/InteractionPrompt';
import InteractionMenu from './ui/InteractionMenu';
import { useChat } from '../hooks/useChat';
import { getQuickInfo } from '../lib/api';
import type { InfoCategory } from '../lib/api';
import type { NPCConfig } from '../types';

export default function Game() {
  const [nearNPC, setNearNPC] = useState<NPCConfig | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: 0 });
  const [bubbleMessage, setBubbleMessage] = useState('');
  const [isQuickInfoLoading, setIsQuickInfoLoading] = useState(false);

  // NPC 레벨에 따라 다른 API 엔드포인트 사용
  const { messages, isLoading, error, send, clearMessages, startConversation } = useChat(nearNPC?.level ?? 2);

  // Level 3: 채팅창 열릴 때 NPC가 먼저 인사
  useEffect(() => {
    if (isChatOpen && nearNPC?.level === 3 && messages.length === 0) {
      startConversation();
    }
  }, [isChatOpen, nearNPC?.level, messages.length, startConversation]);

  // F키로 메뉴 열기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f' && nearNPC && !isMenuOpen && !isChatOpen) {
        e.preventDefault();
        try {
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
        } catch {
          // Ignore
        }
        setIsMenuOpen(true);
      }
      if (e.key === 'Escape') {
        if (isChatOpen) {
          setIsChatOpen(false);
          clearMessages();
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearNPC, isMenuOpen, isChatOpen, clearMessages]);

  // 메뉴에서 "대화하기" 선택
  const handleSelectChat = useCallback(() => {
    setIsMenuOpen(false);
    setIsChatOpen(true);
  }, []);

  // 메뉴에서 정보 선택 (말풍선으로 표시) - Level 2 전용
  const handleSelectInfo = useCallback(async (category: InfoCategory) => {
    if (!nearNPC || nearNPC.level !== 2) return;

    setIsQuickInfoLoading(true);
    try {
      const response = await getQuickInfo(category);
      setBubbleMessage(response);
      setIsMenuOpen(false);

      setTimeout(() => {
        setBubbleMessage('');
      }, 8000);
    } catch (err) {
      console.error('Quick info error:', err);
      setBubbleMessage('음... 잠시 생각이 안 나네요.');
      setIsMenuOpen(false);
    } finally {
      setIsQuickInfoLoading(false);
    }
  }, [nearNPC]);

  // 메뉴 닫기
  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // 채팅창 닫기
  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
    clearMessages();
  }, [clearMessages]);

  // 상호작용 중인지 여부 (메뉴 또는 채팅창)
  const isInteracting = isMenuOpen || isChatOpen;

  // 프롬프트 표시 조건
  const showPrompt = !!nearNPC && !isInteracting;

  return (
    <div className="w-full h-full relative">
      <Scene
        onNearNPC={setNearNPC}
        onPlayerPositionChange={setPlayerPosition}
        isInteracting={isInteracting}
        nearNPC={nearNPC}
        bubbleMessage={bubbleMessage}
      />

      <InteractionPrompt show={showPrompt} npcName={nearNPC?.name} />

      <InteractionMenu
        isOpen={isMenuOpen}
        onClose={handleCloseMenu}
        onSelectChat={handleSelectChat}
        onSelectInfo={handleSelectInfo}
        isLoading={isQuickInfoLoading}
        npcConfig={nearNPC}
      />

      <ChatDialog
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        messages={messages}
        onSend={send}
        isLoading={isLoading}
        error={error}
        npcConfig={nearNPC}
      />

      {/* HUD */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
        <p>WASD: 이동</p>
        <p>마우스: 시점 회전</p>
        <p>F: 상호작용 (NPC 근처)</p>
        <p>ESC: 닫기</p>
      </div>

      {/* 세계관 표시 */}
      <div className="absolute top-4 right-4 bg-purple-900/60 text-purple-200 px-3 py-2 rounded-lg text-sm">
        <p className="font-bold">별빛 마을</p>
        <p className="text-xs text-purple-300">4 NPC Demo</p>
      </div>

      {/* 현재 근처 NPC 정보 */}
      {nearNPC && !isInteracting && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm"
          style={{
            background: `linear-gradient(135deg, ${nearNPC.colorTheme.primary}ee, ${nearNPC.colorTheme.secondary}ee)`,
            color: 'white',
          }}
        >
          <p className="font-bold text-center">{nearNPC.name} - {nearNPC.role}</p>
          <p className="text-xs text-center opacity-80">{nearNPC.description}</p>
        </div>
      )}
    </div>
  );
}
