import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { COMBO_MAX } from '../../data/balance';
import { RARITIES } from '../../data/relics';
import { useHaptics } from '../../hooks/useHaptics';
import { useSound } from '../../hooks/useSound';
import { formatNumber } from '../../lib/format';
import { useGameStore } from '../../store/gameStore';
import { useActiveRelic, useDerived, useResource } from '../../store/selectors';
import { InventoryStrip } from '../inventory/InventoryStrip';
import { Sprite } from '../ui/Sprite';
import { BurstParticles, type Burst } from './BurstParticles';
import { ComboMeter } from './ComboMeter';
import { RestoreBar } from './RestoreBar';
import { TapParticles, type Particle } from './TapParticles';

/**
 * Il banco di lavoro: qui passa il 90% del tempo di gioco, quindi qui va messo
 * il 90% del "succo". Ogni tocco deve produrre almeno tre segnali diversi —
 * visivo, sonoro, tattile — entro un frame.
 */
export const Workbench = (): JSX.Element => {
  const { definition, instance, progress } = useActiveRelic();
  const derived = useDerived();
  const polvere = useResource('polvere');
  const tap = useGameStore((state) => state.tap);
  const haptic = useHaptics();
  const play = useSound();

  const [particles, setParticles] = useState<readonly Particle[]>([]);
  const [bursts, setBursts] = useState<readonly Burst[]>([]);
  const [punch, setPunch] = useState(false);
  const [shake, setShake] = useState(false);
  const [idle, setIdle] = useState(true);
  const seq = useRef(0);
  const idleTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    },
    [],
  );

  /**
   * `pointerdown` invece di `click`: su mobile il click arriva ~80 ms dopo il
   * rilascio, e in un clicker quel ritardo si sente come input lag.
   */
  const handleTap = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>): void => {
      if (!definition) return;
      const outcome = tap();
      if (!outcome) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const heat = Math.min(1, (outcome.combo - 1) / (COMBO_MAX - 1));

      setParticles((prev) => [
        ...prev.slice(-11),
        {
          id: seq.current++,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          label: `+${formatNumber(outcome.work, 1)}`,
          crit: outcome.crit,
          heat,
        },
      ]);

      setPunch(true);
      window.setTimeout(() => setPunch(false), 90);

      if (outcome.crit) {
        haptic('success');
        play('crit');
      } else {
        haptic('tap');
        play('tap', outcome.combo);
      }

      if (outcome.restored > 0) {
        // Restauro completato: esplosione di monete, scossa e arpeggio.
        setBursts((prev) => [
          ...prev.slice(-2),
          { id: seq.current++, sprite: 'particella_essenza', count: 14 },
        ]);
        // Il guadagno appare grande al centro dell'oggetto: nessuna notifica
        // che copra proprio la cosa che il giocatore sta guardando.
        setParticles((prev) => [
          ...prev.slice(-11),
          {
            id: seq.current++,
            x: rect.width / 2,
            y: rect.height / 2 - 18,
            label: `+${formatNumber(outcome.essence)} essenza`,
            crit: false,
            heat: 1,
          },
        ]);
        setShake(true);
        window.setTimeout(() => setShake(false), 380);
        haptic('success');
        play('restore');
      }

      setIdle(false);
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setIdle(true), 2_600);
    },
    [definition, haptic, play, tap],
  );

  const removeParticle = useCallback((id: number): void => {
    setParticles((prev) => prev.filter((particle) => particle.id !== id));
  }, []);
  const removeBurst = useCallback((id: number): void => {
    setBursts((prev) => prev.filter((burst) => burst.id !== id));
  }, []);

  if (!definition || !instance) {
    return (
      <div className="grid min-h-[320px] place-items-center text-stone-500">
        Nessuna reliquia sul banco.
      </div>
    );
  }

  const canTap = polvere >= definition.dustPerTap;
  const rarity = RARITIES[definition.rarity];
  const showRestoredName = instance.restoreCount > 0;

  return (
    <section
      className={`flex h-full min-h-0 flex-col items-center gap-1.5 ${
        shake ? 'animate-shake' : ''
      }`}
    >
      {/* Intestazione su una riga: rarità e nome bastano, il resto è dettaglio. */}
      <header className="flex w-full shrink-0 items-baseline justify-center gap-2 text-center">
        <span className={`text-[10px] uppercase tracking-[0.18em] ${rarity.tone.split(' ')[0]}`}>
          {rarity.label}
        </span>
        <h2 className="truncate text-[15px] font-semibold text-amber-100 sm:text-lg">
          {showRestoredName ? definition.restoredName : definition.name}
        </h2>
        <span className="shrink-0 font-mono text-[10px] text-stone-600 tabular-nums">
          ×{instance.restoreCount}
        </span>
      </header>

      <ComboMeter />

      {/*
        Il pulsante prende ESATTAMENTE lo spazio che avanza fra intestazione e
        controlli, invece di una frazione del viewport: con `34vh` su un iPhone
        SE spingeva inventario e barra Pressione fuori dallo schermo.
      */}
      <div className="flex min-h-0 w-full flex-1 items-center justify-center [&>button]:max-h-[260px]">
      <button
        type="button"
        onPointerDown={handleTap}
        onContextMenu={(event) => event.preventDefault()}
        disabled={!canTap}
        aria-label={`Restaura ${definition.name}`}
        className={[
          'relative grid aspect-square h-full max-h-full w-auto max-w-full touch-manipulation',
          'select-none place-items-center rounded-2xl border transition-transform duration-75',
          'border-stone-800 bg-gradient-to-b from-stone-900 to-stone-950',
          canTap ? 'cursor-pointer hover:border-amber-800/70' : 'cursor-not-allowed opacity-60',
          canTap && idle ? 'animate-invite border-amber-700/70' : '',
          punch ? 'scale-[0.955]' : 'scale-100',
          rarity.glow,
        ].join(' ')}
      >
        <div className="relative grid h-[72%] w-[72%] place-items-center">
          <Sprite id={definition.spriteBroken} fill className={punch ? 'brightness-150' : ''} />
          {/* Lo stato restaurato affiora man mano che la barra si riempie. */}
          <Sprite
            id={definition.spriteRestored}
            fill
            className={`pointer-events-none absolute inset-0 transition-opacity duration-150 ${
              punch ? 'brightness-150' : ''
            }`}
            style={{ opacity: progress }}
            aria-hidden
          />
        </div>

        <TapParticles particles={particles} onDone={removeParticle} />
        <BurstParticles bursts={bursts} onDone={removeBurst} />

        {/* L'invito sparisce appena il giocatore capisce, e torna se si ferma. */}
        <span
          className={[
            'pointer-events-none absolute inset-x-0 bottom-2 text-center text-[10px]',
            'font-semibold uppercase tracking-[0.18em] transition-opacity duration-300',
            canTap && idle ? 'text-amber-300/90 opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          tocca per restaurare
        </span>
      </button>
      </div>

      <div className="flex w-full shrink-0 flex-col items-center gap-1.5">
        <RestoreBar progress={progress} />

        {!canTap ? (
          <p className="text-[11px] text-amber-500/80">
            Polvere esaurita — si rigenera a {derived.dustPerSecond.toFixed(1)}/s
          </p>
        ) : (
          <p className="text-[10px] text-stone-600">
            {definition.dustPerTap} polvere per tocco
          </p>
        )}

        {/* Cambiare reliquia deve costare un tocco, non uno scroll. */}
        <InventoryStrip />
      </div>
    </section>
  );
};

export default memo(Workbench);
