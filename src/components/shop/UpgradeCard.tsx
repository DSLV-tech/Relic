import { memo } from 'react';

import { formatNumber } from '../../lib/format';
import { upgradeCost } from '../../lib/math';
import type { UpgradeDefinition } from '../../types/game';
import { Sprite } from '../ui/Sprite';

export interface UpgradeCardProps {
  readonly definition: UpgradeDefinition;
  readonly owned: number;
  readonly balance: number;
  readonly onBuy: (id: string, count: number) => void;
  readonly bulk: number;
}

const KIND_LABEL: Readonly<Record<UpgradeDefinition['kind'], string>> = {
  tapPower: 'potenza tap',
  autoTaps: 'tap/s',
  dustRegen: 'polvere/s',
  valueBonus: 'valore',
  pressureDamp: 'pressione',
};

export const UpgradeCard = memo<UpgradeCardProps>(function UpgradeCard({
  definition,
  owned,
  balance,
  onBuy,
  bulk,
}) {
  const maxed = definition.maxOwned !== undefined && owned >= definition.maxOwned;
  const cost = upgradeCost(definition.baseCost, definition.costGrowth, owned);
  const affordable = !maxed && balance >= cost;
  const currency = definition.costCurrency === 'essenza' ? 'essenza' : 'monete';
  const effectSign = definition.kind === 'pressureDamp' ? '−' : '+';

  return (
    <button
      type="button"
      disabled={!affordable}
      onClick={() => onBuy(definition.id, bulk)}
      className={[
        'group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition',
        affordable
          ? 'border-amber-900/60 bg-stone-900/70 hover:border-amber-600/70 hover:bg-stone-800/70'
          : 'cursor-not-allowed border-stone-800 bg-stone-950/60 opacity-55',
      ].join(' ')}
    >
      <Sprite id={definition.sprite} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-amber-100">{definition.name}</span>
          <span className="shrink-0 font-mono text-[11px] text-stone-500 tabular-nums">
            ×{owned}
            {definition.maxOwned !== undefined && `/${definition.maxOwned}`}
          </span>
        </div>
        <p className="truncate text-[11px] leading-tight text-stone-500">{definition.description}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`font-mono text-xs tabular-nums ${affordable ? 'text-amber-300' : 'text-stone-600'}`}
          >
            {maxed ? 'MAX' : `${formatNumber(cost)} ${currency}`}
          </span>
          <span className="text-[10px] text-teal-500/80">
            {effectSign}
            {definition.kind === 'valueBonus' || definition.kind === 'pressureDamp'
              ? `${Math.round(definition.effectPerUnit * 100)}%`
              : definition.effectPerUnit}{' '}
            {KIND_LABEL[definition.kind]}
          </span>
        </div>
      </div>
    </button>
  );
});
