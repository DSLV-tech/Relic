import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { RARITIES, RELICS } from '../../data/relics';
import { useGameStore } from '../../store/gameStore';
import { Sprite } from '../ui/Sprite';

/**
 * Inventario orizzontale per mobile. Nella v0.3 era una griglia in un pannello
 * separato, sotto la piega: cambiare reliquia richiedeva uno scroll, quindi in
 * pratica nessuno la cambiava. Qui sta sempre sotto il pollice.
 */
export const InventoryStrip = (): JSX.Element => {
  const { owned, activeRelicId, selectRelic } = useGameStore(
    useShallow((state) => ({
      owned: state.relics,
      activeRelicId: state.activeRelicId,
      selectRelic: state.selectRelic,
    })),
  );

  const handleSelect = useCallback((id: string) => selectRelic(id), [selectRelic]);

  return (
    <div className="flex w-full items-center justify-center gap-1.5">
      {RELICS.map((definition) => {
        const instance = owned[definition.id];
        const rarity = RARITIES[definition.rarity];
        const isActive = activeRelicId === definition.id;

        if (!instance) {
          return (
            <div
              key={definition.id}
              title="Non ancora trovata — apri una Cassa Misteriosa"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-dashed border-stone-800 bg-stone-950/60 text-sm text-stone-700"
            >
              ?
            </div>
          );
        }

        return (
          <button
            key={definition.id}
            type="button"
            onClick={() => handleSelect(definition.id)}
            aria-pressed={isActive}
            aria-label={`Metti ${definition.name} sul banco`}
            title={`${definition.name} — restaurata ${instance.restoreCount}×`}
            className={[
              'relative grid h-11 w-11 shrink-0 place-items-center rounded-lg border-2 bg-stone-900/70 transition',
              isActive ? `${rarity.tone} ${rarity.glow}` : 'border-stone-800 active:border-stone-600',
            ].join(' ')}
          >
            <Sprite
              id={instance.restoreCount > 0 ? definition.spriteRestored : definition.spriteBroken}
              size={32}
            />
            {instance.restoreCount > 0 && (
              <span className="absolute -bottom-0.5 right-0.5 font-mono text-[9px] text-amber-300/90 tabular-nums">
                {instance.restoreCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
