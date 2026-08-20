import { useMemo, useState } from 'react';

import { LORE, LORE_BY_ID } from '../../data/lore';
import { useGameStore } from '../../store/gameStore';
import { useUnlockedLore } from '../../store/selectors';
import type { LoreSource, SpriteId } from '../../types/game';
import { Modal } from '../ui/Modal';
import { Sprite } from '../ui/Sprite';

const SOURCE_SPRITE: Readonly<Record<LoreSource, SpriteId>> = {
  aria: 'aria',
  elias: 'zio_tobia',
  ispettore: 'ispettore',
  ordine: 'sacerdote',
};

const SOURCE_LABEL: Readonly<Record<LoreSource, string>> = {
  aria: 'A.R.I.A.',
  elias: 'Zio Elias',
  ispettore: 'Sorveglianza',
  ordine: 'Ordine dei Silenti',
};

export const LoreLog = (): JSX.Element => {
  const unlocked = useUnlockedLore();
  const [openId, setOpenId] = useState<string | null>(null);
  const markLoreOpened = useGameStore((state) => state.markLoreOpened);

  const fragments = useMemo(
    () => LORE.map((fragment) => ({ fragment, known: unlocked.includes(fragment.id) })),
    [unlocked],
  );

  const active = openId ? LORE_BY_ID[openId] : undefined;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-amber-200">Archivio dei Ricordi</h2>
        <span className="font-mono text-[11px] text-stone-500 tabular-nums">
          {unlocked.length}/{LORE.length}
        </span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {fragments.map(({ fragment, known }) => (
          <li key={fragment.id}>
            <button
              type="button"
              disabled={!known}
              onClick={() => {
                setOpenId(fragment.id);
                markLoreOpened();
              }}
              className={[
                'flex w-full items-center gap-2.5 rounded border px-2.5 py-2 text-left transition',
                known
                  ? 'border-stone-800 bg-stone-900/60 hover:border-amber-800/60'
                  : 'cursor-not-allowed border-stone-900 bg-stone-950/50',
              ].join(' ')}
            >
              <Sprite
                id={SOURCE_SPRITE[fragment.source]}
                size={26}
                className={known ? '' : 'opacity-20 grayscale'}
              />
              <div className="min-w-0">
                <p className={`truncate text-xs ${known ? 'text-amber-100' : 'text-stone-700'}`}>
                  {known ? fragment.title : '████████████'}
                </p>
                <p className="text-[10px] text-stone-600">
                  {known ? SOURCE_LABEL[fragment.source] : 'frammento non recuperato'}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <Modal open={active !== undefined} title={active?.title ?? ''} onClose={() => setOpenId(null)}>
        {active && (
          <article className="flex gap-4">
            <Sprite id={SOURCE_SPRITE[active.source]} size={64} className="shrink-0" />
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-teal-400/80">
                {SOURCE_LABEL[active.source]}
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-stone-300">
                {active.body}
              </p>
            </div>
          </article>
        )}
      </Modal>
    </section>
  );
};
