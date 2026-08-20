import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { CRATES } from '../../data/upgrades';
import { RARITIES, RELICS_BY_ID } from '../../data/relics';
import { formatNumber } from '../../lib/format';
import { useGameStore } from '../../store/gameStore';
import { Modal } from '../ui/Modal';
import { Sprite } from '../ui/Sprite';

/**
 * Casse Misteriose. L'attesa artificiale di ~900 ms prima di rivelare il
 * risultato è deliberata: è lì che vive la tensione del gacha.
 */
export const CrateOpener = (): JSX.Element => {
  const [opening, setOpening] = useState(false);

  const { monete, frammenti, openCrate, lastCrateResult, clearCrateResult } = useGameStore(
    useShallow((state) => ({
      monete: state.resources.monete,
      frammenti: state.resources.frammenti,
      openCrate: state.openCrate,
      lastCrateResult: state.lastCrateResult,
      clearCrateResult: state.clearCrateResult,
    })),
  );

  const handleOpen = useCallback(
    (crateId: string) => {
      setOpening(true);
      window.setTimeout(() => {
        openCrate(crateId);
        setOpening(false);
      }, 900);
    },
    [openCrate],
  );

  const result = lastCrateResult;
  const relic = result ? RELICS_BY_ID[result.relicId] : undefined;

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-3 border-b border-stone-800 pb-3">
        <Sprite id="mercante" size={44} />
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-amber-200">Mercato Nero</h2>
          <p className="text-[11px] text-stone-500">Il Mercante non fa domande</p>
        </div>
      </header>

      <div className="flex flex-col gap-2">
        {CRATES.map((crate) => {
          const balance = crate.costCurrency === 'monete' ? monete : frammenti;
          const affordable = balance >= crate.cost && !opening;
          return (
            <button
              key={crate.id}
              type="button"
              disabled={!affordable}
              onClick={() => handleOpen(crate.id)}
              className={[
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition',
                affordable
                  ? 'border-violet-900/60 bg-stone-900/70 hover:border-violet-600/70'
                  : 'cursor-not-allowed border-stone-800 bg-stone-950/60 opacity-55',
              ].join(' ')}
            >
              <Sprite id="slot_inventario" size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-amber-100">{crate.name}</p>
                <p className="truncate text-[11px] text-stone-500">{crate.description}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-amber-300 tabular-nums">
                {formatNumber(crate.cost)}{' '}
                {crate.costCurrency === 'monete' ? '🪙' : '💎'}
              </span>
            </button>
          );
        })}
      </div>

      {opening && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-violet-300">
          <Sprite id="vortice_temporale" size={20} className="animate-spin [animation-duration:1s]" />
          Il sigillo si apre…
        </div>
      )}

      <Modal
        open={result !== null && !opening}
        title={result?.duplicate ? 'Doppione' : 'Nuova reliquia'}
        onClose={clearCrateResult}
      >
        {result && relic && (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className={`rounded-xl border-2 p-4 ${RARITIES[result.rarity].tone} ${RARITIES[result.rarity].glow}`}>
              <Sprite id={relic.spriteBroken} size={96} />
            </div>
            <p className={`text-xs uppercase tracking-[0.2em] ${RARITIES[result.rarity].tone.split(' ')[0]}`}>
              {RARITIES[result.rarity].label}
            </p>
            <p className="text-lg font-semibold text-amber-100">{relic.name}</p>
            <p className="max-w-sm text-sm text-stone-400">
              {result.duplicate
                ? `Ne avevi già una. Il Mercante te la ricompra: +${formatNumber(result.refund)} essenza.`
                : 'Aggiunta all’inventario. Portala sul banco per estrarne il ricordo.'}
            </p>
            <button
              type="button"
              onClick={clearCrateResult}
              className="rounded border border-amber-700/60 px-4 py-1.5 text-sm text-amber-200 transition hover:bg-amber-700/20"
            >
              Continua
            </button>
          </div>
        )}
      </Modal>
    </section>
  );
};
