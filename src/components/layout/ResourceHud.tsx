import { memo } from 'react';

import { RESOURCES } from '../../data/relics';
import { formatNumber } from '../../lib/format';
import { useDerived, useGameStoreResources } from './hudSelectors';
import { Sprite } from '../ui/Sprite';
import type { SpriteId } from '../../types/game';

interface ResourceChipProps {
  readonly label: string;
  readonly short: string;
  readonly value: number;
  readonly sprite: SpriteId;
  readonly hint: string;
  readonly rate?: string;
  readonly cap?: number;
  readonly onExplain: () => void;
}

const ResourceChip = memo<ResourceChipProps>(function ResourceChip({
  label,
  short,
  value,
  sprite,
  hint,
  rate,
  cap,
  onExplain,
}) {
  const ratio = cap !== undefined ? Math.min(1, value / cap) : null;

  return (
    <button
      type="button"
      title={hint}
      onClick={onExplain}
      aria-label={`${label}: ${hint}`}
      className="relative flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden rounded-lg border border-stone-800 bg-stone-900/80 px-1.5 py-1 text-left sm:flex-none sm:basis-auto sm:gap-2 sm:px-3 sm:py-2"
    >
      <Sprite id={sprite} size={20} className="shrink-0 sm:h-7 sm:w-7" />
      <span className="flex min-w-0 flex-col leading-none">
        {/* Etichetta minuscola: un numero senza nome non dice niente a chi apre
            il gioco la prima volta, ma non deve costare una riga intera. */}
        <span className="whitespace-nowrap text-[8px] uppercase tracking-tight text-stone-500 sm:text-[9px] sm:tracking-wider">
          <span className="sm:hidden">{short}</span>
          <span className="hidden sm:inline">{label}</span>
        </span>
        <span className="mt-0.5 whitespace-nowrap font-mono text-[13px] text-amber-100 tabular-nums sm:text-base">
          {formatNumber(value)}
          {cap !== undefined && (
            <span className="hidden text-stone-600 sm:inline"> / {formatNumber(cap)}</span>
          )}
        </span>
      </span>
      {rate && (
        <span className="ml-auto hidden shrink-0 text-[10px] text-teal-400/80 sm:block">{rate}</span>
      )}
      {/* Su mobile la capienza diventa una riga sottile alla base del chip:
          si legge con la coda dell'occhio e non ruba altezza. */}
      {ratio !== null && (
        <span
          className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-600 to-amber-300 transition-[width] duration-150"
          style={{ width: `${ratio * 100}%` }}
        />
      )}
    </button>
  );
});

export interface ResourceHudProps {
  /** Toccare una risorsa apre la guida: è la domanda più frequente. */
  readonly onExplain: () => void;
}

export const ResourceHud = ({ onExplain }: ResourceHudProps): JSX.Element => {
  const resources = useGameStoreResources();
  const derived = useDerived();

  return (
    <div className="flex gap-1 sm:flex-wrap sm:gap-2">
      {RESOURCES.map((meta) => (
        <ResourceChip
          key={meta.id}
          label={meta.label}
          short={meta.short}
          sprite={meta.sprite}
          hint={meta.hint}
          onExplain={onExplain}
          value={resources[meta.id]}
          cap={meta.id === 'polvere' ? resources.polvereCap : undefined}
          rate={
            meta.id === 'polvere'
              ? `${derived.dustPerSecond.toFixed(1)}/s`
              : meta.id === 'essenza' && derived.tapsPerSecond > 0
                ? `${derived.tapsPerSecond.toFixed(1)} tap/s`
                : undefined
          }
        />
      ))}
    </div>
  );
};
