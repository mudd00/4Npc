import { useState, useEffect, useRef } from 'react';

export function useInteraction(isNearNPC: boolean, isChatOpen: boolean) {
  const [showPrompt, setShowPrompt] = useState(false);
  const onInteractRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setShowPrompt(isNearNPC && !isChatOpen);
  }, [isNearNPC, isChatOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f' && isNearNPC && !isChatOpen) {
        e.preventDefault();
        try {
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
        } catch {
          // Ignore pointer lock errors
        }
        onInteractRef.current?.();
      }
      if (e.key === 'Escape' && isChatOpen) {
        e.preventDefault();
        onInteractRef.current?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isNearNPC, isChatOpen]);

  const setOnInteract = (callback: () => void) => {
    onInteractRef.current = callback;
  };

  return { showPrompt, setOnInteract };
}
