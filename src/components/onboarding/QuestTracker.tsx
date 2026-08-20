import { memo, useState } from 'react';

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
 *
 * Su mobile sta su UNA riga — il "perché" si apre toccandola. Nella v0.3
 * occupava 100 px fissi di uno schermo da 667, cioè il 15% dello spazio, per
 * un testo che dopo il primo minuto il giocatore non rilegge più.
 */
export const QuestTracker = memo<QuestTrackerProps>(function QuestTracker({
  onGoToTarget,
  currentTab,
}) {
  const { quest, current, goal, index, total } = useCurrentQuest();
  const [expanded, setExpanded] = useState(false);

  if (!quest) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900/50 px-2.5 py-1.5">
        <Sprite id="aria" size={20} />
        <p className="truncate text-[11px] text-stone-500">
          Obiettivi guidati completati. Da qui decidi tu.
        </p>
      </div>
    );
  }

  const ratio = goal > 0 ? Math.min(1, current / goal) : 0;
  const elsewhere = quest.target !== currentTab;

  return (
    <div className="overflow-hidden rounded-lg border border-teal-800/60 bg-gradient-to-r from-teal-950/70 to-stone-900/70">
      <button
        type="button"
        onClick={() => (elsewhere ? onGoToTarget(quest.target) : setExpanded((v) => !v))}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition active:bg-teal-900/20"
      >
        <Sprite id="aria" size={22} className="shrink-0" />

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-1.5">
            <span className="shrink-0 font-mono text-[9px] text-teal-500">
              {index + 1}/{total}
            </span>
            <span className="truncate text-[13px] font-semibold leading-tight text-amber-100">
              {quest.title}
            </span>
          </span>
          {goal > 1 && (
            <span className="mt-1 flex items-center gap-1.5">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-stone-800">
                <span
                  className="block h-full bg-gradient-to-r from-teal-600 to-teal-300 transition-[width] duration-200"
                  style={{ width: `${ratio * 100}%` }}
                />
              </span>
              <span className="shrink-0 font-mono text-[9px] text-stone-500 tabular-nums">
                {formatNumber(current)}/{formatNumber(goal)}
              </span>
            </span>
          )}
        </span>

        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium ${
            elsewhere ? 'bg-teal-900/60 text-teal-300' : 'text-stone-600'
          }`}
        >
          {elsewhere ? `${TARGET_LABEL[quest.target]} →` : expanded ? 'chiudi ⌃' : 'perché? ⌄'}
        </span>
      </button>

      {/* Il "perché" resta a un tocco di distanza invece che sempre a schermo. */}
      {expanded && !elsewhere && (
        <p className="border-t border-teal-900/40 px-2.5 py-2 text-[11px] leading-snug text-stone-400">
          {quest.hint}
          <span className="mt-1 block italic text-teal-500/80">«{quest.aria}»</span>
        </p>
      )}
    </div>
  );
});
