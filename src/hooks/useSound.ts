import { useCallback, useEffect, useState } from 'react';

import { playSound, setMuted, unlockAudio, type SoundId } from '../lib/audio';

const STORAGE_KEY = 'relic-loop-muted';

const readMuted = (): boolean => {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === '1';
};

/**
 * Suono di gioco. Il contesto WebAudio si sblocca al primo gesto reale —
 * i browser rifiutano di suonare prima, e provarci genera solo warning.
 */
export const useSound = (): ((id: SoundId, combo?: number) => void) => {
  useEffect(() => {
    setMuted(readMuted());
    const unlock = (): void => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  return useCallback((id: SoundId, combo = 0) => playSound(id, combo), []);
};

/**
 * Interruttore del muto. La preferenza sta fuori dal salvataggio di gioco:
 * non deve essere azzerata da un prestigio né persa cambiando dispositivo.
 */
export const useMuteToggle = (): readonly [boolean, () => void] => {
  const [muted, setLocalMuted] = useState(readMuted);

  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  const toggle = useCallback(() => {
    setLocalMuted((previous) => {
      const next = !previous;
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  return [muted, toggle] as const;
};
