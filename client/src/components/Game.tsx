import { useState, useEffect, useCallback } from 'react';
import Scene from './three/Scene';
import ChatDialog from './ui/ChatDialog';
import InteractionPrompt from './ui/InteractionPrompt';
import { useChat } from '../hooks/useChat';
import { useInteraction } from '../hooks/useInteraction';

export default function Game() {
  const [isNearNPC, setIsNearNPC] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: 0 });

  const { messages, isLoading, error, send, clearMessages } = useChat();
  const { showPrompt, handleKeyPress } = useInteraction(isNearNPC, isChatOpen);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      if (prev) {
        // Closing chat
        clearMessages();
      }
      return !prev;
    });
  }, [clearMessages]);

  useEffect(() => {
    return handleKeyPress(toggleChat);
  }, [handleKeyPress, toggleChat]);

  return (
    <div className="w-full h-full relative">
      <Scene
        onNearNPC={setIsNearNPC}
        onPlayerPositionChange={setPlayerPosition}
        isChatOpen={isChatOpen}
      />

      <InteractionPrompt show={showPrompt} />

      <ChatDialog
        isOpen={isChatOpen}
        onClose={toggleChat}
        messages={messages}
        onSend={send}
        isLoading={isLoading}
        error={error}
      />

      {/* HUD */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
        <p>클릭: 카메라 조작</p>
        <p>WASD: 이동</p>
        <p>마우스: 시점 회전</p>
        <p>F: 대화 (NPC 근처)</p>
        <p>ESC: 커서 해제</p>
      </div>
    </div>
  );
}
