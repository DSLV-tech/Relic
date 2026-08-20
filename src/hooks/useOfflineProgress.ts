import { useEffect } from 'react';

import { useGameStore } from '../store/gameStore';

/** Applica una sola volta il progresso maturato mentre il gioco era chiuso. */
export const useOfflineProgress = (): void => {
  const applyOfflineProgress = useGameStore((state) => state.applyOfflineProgress);

  useEffect(() => {
    applyOfflineProgress();
  }, [applyOfflineProgress]);
};
