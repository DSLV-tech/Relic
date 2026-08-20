import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { RARITIES } from '../../data/relics';
import { formatNumber } from '../../lib/format';
import { useHaptics } from '../../hooks/useHaptics';
import { useGameStore } from '../../store/gameStore';
import { useActiveRelic, useDerived, useResource } from '../../store/selectors';
import { Sprite } from '../ui/Sprite';
import { RestoreBar } from './RestoreBar';
import { TapParticles, type Particle } from './TapParticles';

/**
 * Il banco di lavoro: il 90% del tempo di gioco passa qui.
 * Ogni tap deve dare un feedback immediato — scala, particella, numero.
 */
export const Workbench = (): JSX.Element => {
  const { definition, instance, progress } = useActiveRelic();
  const derived = useDerived();
  const polvere = useResource('polvere');
  const tap = useGameStore((state) => state.tap);
  const haptic = useHaptics();

  const [particles, setParticles] = useState<readonly Particle[]>([]);
  const [punch, setPunch] = useState(false);
  // Se il giocatore sta fermo per qualche secondo, il banco torna a invitarlo.
  const [idle, setIdle] = useState(true);
  const seq = useRef(0);
  const idleTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    },
    [],
  );

  const canTap = definition !== undefined && polvere >= definition.dustPerTap;

  /**
   * `pointerdown` invece di `click`: su mobile il click arriva ~80 ms dopo il
   * rilascio, e in un clicker quel ritardo si sente come input lag.
   */
  const handleTap = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>): void => {
      if (!canTap || !definition) return;
      tap();
      haptic('tap');

      const rect = event.currentTarget.getBoundingClientRect();
      const particle: Particle = {
        id: seq.current++,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        label: `+${formatNumber(derived.tapPower, 1)}`,
      };
      setParticles((prev) => [...prev.slice(-11), particle]);
      setPunch(true);
      window.setTimeout(() => setPunch(false), 90);

      setIdle(false);
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setIdle(true), 2_600);
    },
    [canTap, definition, derived.tapPower, haptic, tap],
  );

  const removeParticle = useCallback((id: number): void => {
    setParticles((prev) => prev.filter((particle) => particle.id !== id));
  }, []);

  if (!definition || !instance) {
    return (
      <div className="grid min-h-[320px] place-items-center text-stone-500">
        Nessuna reliquia sul banco.
      </div>
    );
  }

  const rarity = RARITIES[definition.rarity];
  // Il nome passa a "restaurato" appena l'oggetto è stato completato almeno una
  // volta e si è ripartiti da capo; lo sprite invece dissolve con il progresso.
  const showRestoredName = instance.restoreCount > 0;

  return (
    <section className="flex h-full flex-col items-center justify-center gap-3 sm:gap-5 sm:py-2">
      <header className="text-center">
        <p className={`text-[11px] uppercase tracking-[0.2em] ${rarity.tone.split(' ')[0]}`}>
          {rarity.label}
        </p>
        <h2 className="text-base font-semibold text-amber-100 sm:text-lg">
          {showRestoredName ? definition.restoredName : definition.name}
        </h2>
        <p className="text-xs text-stone-500">
          restaurata {instance.restoreCount}× · {definition.dustPerTap} polvere per tap
        </p>
      </header>

      <button
        type="button"
        onPointerDown={handleTap}
        onContextMenu={(event) => event.preventDefault()}
        disabled={!canTap}
        aria-label={`Restaura ${definition.name}`}
        className={[
          'relative grid h-52 w-52 touch-manipulation select-none place-items-center rounded-2xl border',
          'transition-transform duration-75 sm:h-56 sm:w-56',
          'border-stone-800 bg-gradient-to-b from-stone-900 to-stone-950',
          canTap ? 'cursor-pointer hover:border-amber-800/70' : 'cursor-not-allowed opacity-60',
          canTap && idle ? 'animate-invite border-amber-700/70' : '',
          punch ? 'scale-[0.965]' : 'scale-100',
          rarity.glow,
        ].join(' ')}
      >
        <div className="relative grid place-items-center">
          <Sprite
            id={definition.spriteBroken}
            size={160}
            className={punch ? 'brightness-125' : ''}
          />
          {/* Lo stato restaurato affiora man mano che la barra si riempie. */}
          <Sprite
            id={definition.spriteRestored}
            size={160}
            className={`pointer-events-none absolute inset-0 transition-opacity duration-150 ${punch ? 'brightness-125' : ''}`}
            style={{ opacity: progress }}
            aria-hidden
          />
        </div>
        <TapParticles particles={particles} onDone={removeParticle} />

        {/* L'invito sparisce appena il giocatore capisce, e torna se si ferma. */}
        <span
          className={[
            'pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px]',
            'font-semibold uppercase tracking-[0.18em] transition-opacity duration-300',
            canTap && idle ? 'text-amber-300/90 opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          tocca per restaurare
        </span>
      </button>

      <RestoreBar progress={progress} />

      {!canTap && (
        <p className="text-xs text-amber-500/80">
          Polvere esaurita — si rigenera a {derived.dustPerSecond.toFixed(1)}/s
        </p>
      )}
    </section>
  );
};

export default memo(Workbench);
