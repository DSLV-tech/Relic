import { memo } from 'react';

import { formatNumber } from '../../lib/format';
import { useCurrentQuest } from '../../store/selectors';
import type { QuestTarget } from '../../types/game';
import { Sprite } from '../ui/Sprite';

const TARGET_LABEL: Readonly<Record<QuestTarget, string>> = {
  banco: 'Banco',
  bottega: 'A.R.I.A.',
  mercato: 'Mercato',
  archivio: 'Ricordi',
};

export interface QuestTrackerProps {
  /** Chiamata quando il giocatore tocca il tracker: porta alla sezione giusta. */
  readonly onGoToTarget: (target: QuestTarget) => void;
  readonly currentTab: QuestTarget;
}

/**
 * La riga più importante dell'interfaccia: dice sempre cosa fare adesso.
 * Sostituisce il tutorial a modali — non si chiude, non si dimentica, e resta
 * utile anche dopo le prime ore.
 */
export const QuestTracker = memo<QuestTrackerProps>(function QuestTracker({
  onGoToTarget,
  currentTab,
}) {
  const { quest, current, goal, index, total } = useCurrentQuest();

  if (!quest) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-stone-800 bg-stone-900/50 px-3 py-2">
        <Sprite id="aria" size={26} />
        <p className="text-[11px] text-stone-500">
          Hai completato tutti gli obiettivi guidati. Da qui in poi decidi tu.
        </p>
      </div>
    );
  }

  const ratio = goal > 0 ? Math.min(1, current / goal) : 0;
  const elsewhere = quest.target !== currentTab;

  return (
    <button
      type="button"
      onClick={() => onGoToTarget(quest.target)}
      className="w-full rounded-lg border border-teal-800/60 bg-gradient-to-r from-teal-950/70 to-stone-900/70 px-3 py-2.5 text-left transition active:scale-[0.99] hover:border-teal-600/70"
    >
      <div className="flex items-start gap-2.5">
        <Sprite id="aria" size={30} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-teal-500">
              Obiettivo {index + 1}/{total}
            </span>
            {elsewhere && (
              <span className="rounded bg-teal-900/60 px-1.5 py-px text-[9px] font-medium text-teal-300">
                vai in {TARGET_LABEL[quest.target]} →
              </span>
            )}
          </div>
          <p className="text-sm font-semibold leading-snug text-amber-100">{quest.title}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-stone-400">{quest.hint}</p>

          {goal > 1 && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded bg-stone-800">
                <div
                  className="h-full bg-gradient-to-r from-teal-600 to-teal-300 transition-[width] duration-200"
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
              <span className="shrink-0 font-mono text-[10px] text-stone-500 tabular-nums">
                {formatNumber(current)}/{formatNumber(goal)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
});
