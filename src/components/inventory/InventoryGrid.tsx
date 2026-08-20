import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { RARITIES, RELICS, RELICS_BY_ID } from '../../data/relics';
import { useGameStore } from '../../store/gameStore';
import { Sprite } from '../ui/Sprite';

export const InventoryGrid = (): JSX.Element => {
  const { owned, activeRelicId, selectRelic } = useGameStore(
    useShallow((state) => ({
      owned: state.relics,
      activeRelicId: state.activeRelicId,
      selectRelic: state.selectRelic,
    })),
  );

  const handleSelect = useCallback((id: string) => selectRelic(id), [selectRelic]);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-wide text-amber-200">Inventario</h2>
      <div className="grid grid-cols-4 gap-2">
        {RELICS.map((definition) => {
          const instance = owned[definition.id];
          const rarity = RARITIES[definition.rarity];
          const isActive = activeRelicId === definition.id;

          if (!instance) {
            return (
              <div
                key={definition.id}
                title="Non ancora trovata — apri una Cassa Misteriosa"
                className="relative grid aspect-square place-items-center rounded border border-stone-800 bg-stone-950/70"
              >
                <Sprite id="slot_inventario" size={40} className="opacity-30" />
                <span className="absolute text-lg text-stone-700">?</span>
              </div>
            );
          }

          return (
            <button
              key={definition.id}
              type="button"
              onClick={() => handleSelect(definition.id)}
              title={`${definition.name} — restaurata ${instance.restoreCount}×`}
              className={[
                'relative grid aspect-square place-items-center rounded border-2 transition',
                isActive ? `${rarity.tone} ${rarity.glow}` : 'border-stone-800 hover:border-stone-600',
                'bg-stone-900/60',
              ].join(' ')}
            >
              <Sprite
                id={instance.restoreCount > 0 ? definition.spriteRestored : definition.spriteBroken}
                size={44}
              />
              {instance.restoreCount > 0 && (
                <span className="absolute bottom-0.5 right-1 font-mono text-[10px] text-amber-300/90 tabular-nums">
                  {instance.restoreCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] leading-snug text-stone-600">
        {RELICS_BY_ID[activeRelicId]?.name ?? '—'} è sul banco. Clicca un'altra reliquia per
        cambiarla: gli Apprendisti lavorano solo su quella attiva.
      </p>
    </section>
  );
};
