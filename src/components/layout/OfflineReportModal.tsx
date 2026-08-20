import { formatDuration, formatNumber } from '../../lib/format';
import { useGameStore } from '../../store/gameStore';
import { Modal } from '../ui/Modal';
import { Sprite } from '../ui/Sprite';

/** Il "bentornato": la ricompensa che rende il rientro soddisfacente. */
export const OfflineReportModal = (): JSX.Element => {
  const report = useGameStore((state) => state.offlineReport);
  const clear = useGameStore((state) => state.clearOfflineReport);

  return (
    <Modal open={report !== null} title="Mentre eri via" onClose={clear}>
      {report && (
        <div className="flex flex-col items-center gap-4 text-center">
          <Sprite id="aria" size={80} />
          <p className="text-sm text-stone-300">
            Gli Apprendisti hanno lavorato per{' '}
            <strong className="text-amber-200">{formatDuration(report.elapsedMs)}</strong>.
          </p>
          <dl className="grid w-full grid-cols-2 gap-2 text-left">
            <div className="rounded border border-stone-800 bg-stone-900/60 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-widest text-stone-500">Essenza</dt>
              <dd className="font-mono text-lg text-teal-300 tabular-nums">
                +{formatNumber(report.essenceGained)}
              </dd>
            </div>
            <div className="rounded border border-stone-800 bg-stone-900/60 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-widest text-stone-500">Restauri</dt>
              <dd className="font-mono text-lg text-amber-300 tabular-nums">
                {report.relicsRestored}
              </dd>
            </div>
          </dl>
          {report.cappedByDust && (
            <p className="text-[11px] text-amber-500/80">
              La Polvere è finita prima del tuo ritorno. Potenzia il Filtro del Tempo.
            </p>
          )}
          <button
            type="button"
            onClick={clear}
            className="rounded border border-amber-700/60 px-5 py-1.5 text-sm text-amber-200 transition hover:bg-amber-700/20"
          >
            Riprendi il lavoro
          </button>
        </div>
      )}
    </Modal>
  );
};
