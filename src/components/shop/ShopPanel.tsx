import { useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { UPGRADES } from '../../data/upgrades';
import { useSound } from '../../hooks/useSound';
import { useGameStore } from '../../store/gameStore';
import { Sprite } from '../ui/Sprite';
import { UpgradeCard } from './UpgradeCard';

const BULK_OPTIONS = [1, 10, 25] as const;
type BulkOption = (typeof BULK_OPTIONS)[number];

export const ShopPanel = (): JSX.Element => {
  const [bulk, setBulk] = useState<BulkOption>(1);
  const play = useSound();

  const { upgrades, essenza, monete, totalEssenceEarned, buyUpgrade } = useGameStore(
    useShallow((state) => ({
      upgrades: state.upgrades,
      essenza: state.resources.essenza,
      monete: state.resources.monete,
      totalEssenceEarned: state.totalEssenceEarned,
      buyUpgrade: state.buyUpgrade,
    })),
  );

  // Il filtro degli sblocchi dipende solo dal totale storico: memoizzarlo
  // evita di ricalcolare la lista ad ogni tick.
  const visible = useMemo(
    () => UPGRADES.filter((upgrade) => totalEssenceEarned >= upgrade.unlockAtTotalEssence),
    [totalEssenceEarned],
  );

  const nextLocked = useMemo(
    () => UPGRADES.find((upgrade) => totalEssenceEarned < upgrade.unlockAtTotalEssence),
    [totalEssenceEarned],
  );

  const handleBuy = useCallback(
    (id: string, count: number) => {
      buyUpgrade(id, count);
      play('purchase');
    },
    [buyUpgrade, play],
  );

  return (
    <section className="flex flex-col gap-3 lg:h-full lg:min-h-0">
      <header className="flex items-center gap-2 border-b border-stone-800 pb-2 sm:gap-3 sm:pb-3">
        <Sprite id="aria" size={30} className="shrink-0 sm:h-11 sm:w-11" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[13px] font-semibold tracking-wide text-teal-200 sm:overflow-visible sm:whitespace-normal sm:text-sm">
            Terminale di A.R.I.A.
          </h2>
          <p className="hidden text-[11px] text-stone-500 sm:block">Potenziamenti e automazione</p>
        </div>
        <div className="flex overflow-hidden rounded border border-stone-700">
          {BULK_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setBulk(option)}
              className={`px-2 py-1 text-[11px] font-mono transition ${
                bulk === option ? 'bg-amber-700/40 text-amber-200' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              ×{option}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
        {visible.map((definition) => (
          <UpgradeCard
            key={definition.id}
            definition={definition}
            owned={upgrades[definition.id] ?? 0}
            balance={definition.costCurrency === 'essenza' ? essenza : monete}
            onBuy={handleBuy}
            bulk={bulk}
          />
        ))}

        {nextLocked && (
          <div className="rounded-lg border border-dashed border-stone-800 px-3 py-3 text-center">
            <p className="text-[11px] text-stone-600">
              Prossimo sblocco a {Math.round(nextLocked.unlockAtTotalEssence)} essenza totale
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
