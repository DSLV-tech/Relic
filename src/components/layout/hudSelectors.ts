import { useShallow } from 'zustand/react/shallow';

import { DUST_CAP_BASE, DUST_CAP_PER_PRESTIGE } from '../../data/balance';
import { useGameStore } from '../../store/gameStore';
import type { Resources } from '../../types/game';

export interface HudResources extends Resources {
  readonly polvereCap: number;
}

/** Un solo selettore per la HUD: quattro numeri che cambiano insieme. */
export const useGameStoreResources = (): HudResources =>
  useGameStore(
    useShallow((state) => ({
      ...state.resources,
      polvereCap: DUST_CAP_BASE + state.prestigeCount * DUST_CAP_PER_PRESTIGE,
    })),
  );

export { useDerived } from '../../store/selectors';
