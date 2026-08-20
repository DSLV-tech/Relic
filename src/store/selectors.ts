import { useShallow } from 'zustand/react/shallow';

import { QUESTS } from '../data/quests';
import { RELICS_BY_ID } from '../data/relics';
import { shardsFromEssence } from '../lib/math';
import type { Quest, QuestTarget, RelicDefinition, RelicInstance } from '../types/game';
import { currentQuest, toProgressView, useGameStore } from './gameStore';

/**
 * Selettori granulari. Il tick gira a 10 Hz: se un componente legge solo
 * `polvere` non deve ri-renderizzare quando cambia l'inventario.
 */

export const useResource = (id: 'polvere' | 'essenza' | 'monete' | 'frammenti'): number =>
  useGameStore((state) => state.resources[id]);

export const useDerived = () => useGameStore((state) => state.derived);

export const useActiveRelic = (): {
  definition: RelicDefinition | undefined;
  instance: RelicInstance | undefined;
  progress: number;
} =>
  useGameStore(
    useShallow((state) => {
      const instance = state.relics[state.activeRelicId];
      const definition = instance ? RELICS_BY_ID[instance.definitionId] : undefined;
      const required = definition
        ? definition.baseWork * Math.pow(1.12, instance?.restoreCount ?? 0)
        : 1;
      return {
        definition,
        instance,
        progress: instance ? Math.min(1, instance.work / required) : 0,
      };
    }),
  );

export const useOwnedRelicIds = (): readonly string[] =>
  useGameStore(useShallow((state) => Object.keys(state.relics)));

export const useUpgradeLevel = (upgradeId: string): number =>
  useGameStore((state) => state.upgrades[upgradeId] ?? 0);

export const useInspector = () => useGameStore(useShallow((state) => state.inspector));

export const usePrestigePreview = (): { available: number; lifetime: number; count: number } =>
  useGameStore(
    useShallow((state) => ({
      available: shardsFromEssence(state.lifetimeEssence),
      lifetime: state.lifetimeEssence,
      count: state.prestigeCount,
    })),
  );

export const useUnlockedLore = (): readonly string[] =>
  useGameStore(useShallow((state) => state.unlockedLore));

export const useToasts = () => useGameStore(useShallow((state) => state.toasts));

export const useTotalEssenceEarned = (): number =>
  useGameStore((state) => state.totalEssenceEarned);

// ─────────────────────────────────────────────────────────── Onboarding

/**
 * Obiettivo corrente più il suo progresso. Un solo selettore per tutta la
 * catena: il tracker si aggiorna quando serve, il resto della UI resta fermo.
 */
export const useCurrentQuest = (): {
  quest: Quest | undefined;
  current: number;
  goal: number;
  index: number;
  total: number;
} =>
  useGameStore(
    useShallow((state) => {
      const view = toProgressView(state);
      const quest = currentQuest(state);
      return {
        quest,
        current: quest ? quest.progress(view) : 0,
        goal: quest ? quest.goal : 0,
        index: state.completedQuests.length,
        total: QUESTS.length,
      };
    }),
  );

/** Sezione da evidenziare: quella richiesta dall'obiettivo corrente. */
export const useQuestTarget = (): QuestTarget | null =>
  useGameStore((state) => currentQuest(state)?.target ?? null);

export const useIntroSeen = (): boolean => useGameStore((state) => state.introSeen);
