import { useState, useEffect, useCallback } from 'react';

export function useInteraction(isNearNPC: boolean, isChatOpen: boolean) {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    setShowPrompt(isNearNPC && !isChatOpen);
  }, [isNearNPC, isChatOpen]);

  const handleKeyPress = useCallback(
    (onInteract: () => void) => {
      const handler = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'f' && isNearNPC && !isChatOpen) {
          onInteract();
        }
        if (e.key === 'Escape' && isChatOpen) {
          onInteract();
        }
      };

      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    },
    [isNearNPC, isChatOpen]
  );

  return { showPrompt, handleKeyPress };
}
