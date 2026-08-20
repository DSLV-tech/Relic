import { memo } from 'react';

import { RESOURCES } from '../../data/relics';
import { formatNumber, formatRate } from '../../lib/format';
import { useDerived, useGameStoreResources } from './hudSelectors';
import { Sprite } from '../ui/Sprite';

interface ResourceChipProps {
  readonly label: string;
  readonly short: string;
  readonly onExplain: () => void;
  readonly value: number;
  readonly sprite: Parameters<typeof Sprite>[0]['id'];
  readonly hint: string;
  readonly rate?: string;
  readonly cap?: number;
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
      className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900/80 px-2 py-1.5 sm:min-w-[140px] sm:flex-none sm:gap-2 sm:px-3 sm:py-2"
    >
      <Sprite id={sprite} size={22} className="shrink-0 sm:h-7 sm:w-7" />
      <div className="flex flex-col leading-tight">
        {/* Un numero senza etichetta non dice niente a chi apre il gioco per
            la prima volta: la versione corta resta anche su schermo stretto. */}
        <span className="text-[9px] uppercase tracking-wider text-stone-500 sm:tracking-widest">
          <span className="sm:hidden">{short}</span>
          <span className="hidden sm:inline">{label}</span>
        </span>
        <span className="text-left font-mono text-sm text-amber-100 tabular-nums sm:text-base">
          {formatNumber(value)}
          {cap !== undefined && (
            <span className="hidden text-stone-600 sm:inline"> / {formatNumber(cap)}</span>
          )}
        </span>
        {rate && <span className="truncate text-[9px] text-teal-400/80 sm:text-[10px]">{rate}</span>}
      </div>
      {ratio !== null && (
        <div className="ml-auto h-8 w-1 overflow-hidden rounded bg-stone-800">
          <div
            className="w-full rounded bg-gradient-to-t from-amber-600 to-amber-300 transition-[height] duration-150"
            style={{ height: `${ratio * 100}%`, marginTop: `${(1 - ratio) * 100}%` }}
          />
        </div>
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
    <div className="sticky top-0 z-20 -mx-3 flex gap-1.5 border-b border-stone-900 bg-stone-950/90 px-3 py-2 backdrop-blur sm:static sm:mx-0 sm:flex-wrap sm:gap-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
      {RESOURCES.map((meta) => (
        <ResourceChip
          key={meta.id}
          label={meta.label}
          short={meta.short}
          onExplain={onExplain}
          sprite={meta.sprite}
          hint={meta.hint}
          value={resources[meta.id]}
          cap={meta.id === 'polvere' ? resources.polvereCap : undefined}
          rate={
            meta.id === 'polvere'
              ? formatRate(derived.dustPerSecond)
              : meta.id === 'essenza' && derived.tapsPerSecond > 0
                ? `${derived.tapsPerSecond.toFixed(1)} tap/s`
                : undefined
          }
        />
      ))}
    </div>
  );
};
