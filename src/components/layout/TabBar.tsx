import { memo } from 'react';

import type { SpriteId } from '../../types/game';
import { Sprite } from '../ui/Sprite';

export type TabId = 'banco' | 'bottega' | 'mercato' | 'archivio';

export interface TabDefinition {
  readonly id: TabId;
  readonly label: string;
  readonly sprite: SpriteId;
}

export const TABS: readonly TabDefinition[] = [
  { id: 'banco', label: 'Banco', sprite: 'ingranaggio_precisione' },
  { id: 'bottega', label: 'A.R.I.A.', sprite: 'aria' },
  { id: 'mercato', label: 'Mercato', sprite: 'mercante' },
  { id: 'archivio', label: 'Ricordi', sprite: 'tomo_iniziazione' },
] as const;

export interface TabBarProps {
  readonly active: TabId;
  readonly onChange: (tab: TabId) => void;
  /** Pallino di notifica per tab, es. nuovo ricordo sbloccato. */
  readonly badges?: Partial<Record<TabId, boolean>>;
  /** Sezione richiesta dall'obiettivo corrente: pulsa finché non ci vai. */
  readonly questTarget?: TabId | null;
}

/**
 * Navigazione mobile. Sta in fondo perché è l'unica zona raggiungibile col
 * pollice a una mano su schermi da 6"+; il pulsante di tap resta al centro.
 */
export const TabBar = memo<TabBarProps>(function TabBar({
  active,
  onChange,
  badges,
  questTarget,
}) {
  return (
    <nav
      aria-label="Sezioni"
      /*
       * Elemento normale del flusso, non `fixed`: lo shell mobile è già alto
       * esattamente un viewport, e da fissa si sovrapponeva alla barra di stato
       * invece di riservarle spazio.
       */
      className="shrink-0 border-t border-stone-800 bg-stone-950/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          const wanted = questTarget === tab.id && !isActive;
          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'relative flex h-14 w-full flex-col items-center justify-center gap-0.5 transition sm:h-16',
                  isActive ? 'text-amber-200' : wanted ? 'text-teal-300' : 'text-stone-600',
                ].join(' ')}
              >
                <Sprite
                  id={tab.sprite}
                  size={26}
                  className={isActive || wanted ? '' : 'opacity-45 grayscale'}
                />
                <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
                {badges?.[tab.id] && (
                  <span className="absolute right-[22%] top-2 h-2 w-2 rounded-full bg-violet-400" />
                )}
                {isActive && (
                  <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-amber-400/80" />
                )}
                {wanted && (
                  <span className="animate-quest-ring absolute inset-x-5 inset-y-2 rounded-lg" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
