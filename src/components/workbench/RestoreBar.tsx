import { memo } from 'react';

import { formatPercent } from '../../lib/format';

export interface RestoreBarProps {
  readonly progress: number;
}

export const RestoreBar = memo<RestoreBarProps>(function RestoreBar({ progress }) {
  return (
    <div className="w-full max-w-sm shrink-0">
      <div className="h-3.5 overflow-hidden rounded border-2 border-stone-800 bg-stone-900 sm:h-4">
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-full bg-gradient-to-r from-amber-700 via-amber-400 to-amber-200 transition-[width] duration-100 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-0.5 text-center font-mono text-[10px] text-stone-500 tabular-nums">
        {formatPercent(progress, 1)}
      </p>
    </div>
  );
});
