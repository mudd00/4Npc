import { useState, useEffect } from 'react';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export function useKeyboardControls(disabled: boolean = false): KeyState {
  const [keys, setKeys] = useState<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    if (disabled) {
      setKeys({ forward: false, backward: false, left: false, right: false });
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys((prev) => ({
        ...prev,
        forward: key === 'w' ? true : prev.forward,
        backward: key === 's' ? true : prev.backward,
        left: key === 'a' ? true : prev.left,
        right: key === 'd' ? true : prev.right,
      }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys((prev) => ({
        ...prev,
        forward: key === 'w' ? false : prev.forward,
        backward: key === 's' ? false : prev.backward,
        left: key === 'a' ? false : prev.left,
        right: key === 'd' ? false : prev.right,
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled]);

  return keys;
}
