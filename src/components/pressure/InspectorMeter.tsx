import { useEffect, useState } from 'react';

import { HIDE_WINDOW_MS, PRESSURE_SUSPICION, PRESSURE_VISIT } from '../../data/balance';
import { useHaptics } from '../../hooks/useHaptics';
import { formatPercent } from '../../lib/format';
import { useGameStore } from '../../store/gameStore';
import { useInspector } from '../../store/selectors';
import { Modal } from '../ui/Modal';
import { Sprite } from '../ui/Sprite';

const PHASE_COPY: Readonly<Record<string, string>> = {
  calmo: 'La bottega è tranquilla.',
  sospetto: 'Qualcuno osserva dalla vetrina.',
  visita: "L'Ispettore sta entrando.",
  perquisizione: 'Sta per entrare. Rallenta il ritmo.',
};

export const InspectorMeter = (): JSX.Element => {
  const inspector = useInspector();
  const hideArtifacts = useGameStore((state) => state.hideArtifacts);
  const [remaining, setRemaining] = useState(HIDE_WINDOW_MS);
  const haptic = useHaptics();

  // La visita è l'unico evento che può cogliere il giocatore fuori dallo schermo:
  // la vibrazione è il canale giusto per segnalarla.
  useEffect(() => {
    if (inspector.hiding) haptic('alert');
  }, [inspector.hiding, haptic]);

  useEffect(() => {
    if (!inspector.hiding || inspector.nextVisitAt === null) return;
    const id = window.setInterval(() => {
      setRemaining(Math.max(0, (inspector.nextVisitAt ?? 0) - Date.now()));
    }, 100);
    return () => window.clearInterval(id);
  }, [inspector.hiding, inspector.nextVisitAt]);

  const tone =
    inspector.pressure >= PRESSURE_VISIT
      ? 'from-red-700 to-red-400'
      : inspector.pressure >= PRESSURE_SUSPICION
        ? 'from-amber-700 to-amber-400'
        : 'from-teal-800 to-teal-500';

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-stone-800 bg-stone-900/60 px-3 py-2">
        <Sprite
          id="ispettore"
          size={32}
          className={inspector.pressure >= PRESSURE_VISIT ? 'animate-pulse' : ''}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-widest text-stone-500">Pressione</span>
            <span className="font-mono text-[11px] text-stone-400 tabular-nums">
              {formatPercent(inspector.pressure)}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded bg-stone-800">
            <div
              className={`h-full bg-gradient-to-r transition-[width] duration-200 ${tone}`}
              style={{ width: `${inspector.pressure * 100}%` }}
            />
          </div>
          <p className="mt-1 truncate text-[10px] text-stone-600">
            {PHASE_COPY[inspector.phase]} · {inspector.visitsSurvived} visite superate
          </p>
        </div>
      </div>

      <Modal
        open={inspector.hiding}
        title="Visita dell'Ispettore"
        onClose={() => undefined}
        dismissible={false}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Sprite id="ispettore" size={96} className="animate-pulse" />
          <p className="text-sm text-stone-300">
            Ha la mano sulla maniglia. Metti via tutto quello che brilla, adesso.
          </p>
          <div className="w-full">
            <div className="h-3 overflow-hidden rounded bg-stone-800">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-red-400 transition-[width] duration-100"
                style={{ width: `${(remaining / HIDE_WINDOW_MS) * 100}%` }}
              />
            </div>
            <p className="mt-1 font-mono text-xs text-red-300 tabular-nums">
              {(remaining / 1_000).toFixed(1)}s
            </p>
          </div>
          <button
            type="button"
            onClick={hideArtifacts}
            className="rounded-lg border-2 border-amber-500 bg-amber-600/20 px-6 py-2.5 font-semibold text-amber-200 transition hover:bg-amber-600/35"
          >
            Nascondi gli artefatti
          </button>
          <p className="text-[11px] text-stone-500">
            Se non fai in tempo perdi il 40% dell'essenza e il 60% delle monete.
          </p>
        </div>
      </Modal>
    </>
  );
};
