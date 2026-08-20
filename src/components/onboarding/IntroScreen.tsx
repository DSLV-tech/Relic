import { useState } from 'react';

import { useGameStore } from '../../store/gameStore';
import { Sprite } from '../ui/Sprite';

interface Beat {
  readonly sprite: Parameters<typeof Sprite>[0]['id'];
  readonly text: string;
}

/**
 * Tre battute, non un muro di testo. Chi vuole leggere legge, chi vuole giocare
 * arriva al pulsante in due tocchi.
 */
const BEATS: readonly Beat[] = [
  {
    sprite: 'antiquario',
    text:
      'Tuo zio Elias è scomparso undici anni fa. Ti ha lasciato una bottega di ' +
      'antiquariato a Vercelli, le chiavi in una busta e nessuna spiegazione.',
  },
  {
    sprite: 'orologio_rotto',
    text:
      'Il primo oggetto che pulisci è un orologio da taschino rotto. Mentre lo ' +
      'ripari emette una luce dorata e ti trasmette il ricordo di chi lo possedeva ' +
      'nel 1873. Non stai restaurando oggetti: stai richiudendo crepe nella storia.',
  },
  {
    sprite: 'ispettore',
    text:
      "Qualcuno preferirebbe che quelle crepe restassero aperte. L'Ordine dei " +
      'Silenti manda un ispettore. Non entra mai. Guarda soltanto.',
  },
];

export const IntroScreen = (): JSX.Element => {
  const [beat, setBeat] = useState(0);
  const dismissIntro = useGameStore((state) => state.dismissIntro);
  const isLast = beat === BEATS.length - 1;
  const current = BEATS[beat];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-stone-950 px-5 py-8">
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 text-center">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-amber-200 sm:text-3xl">
            Relic Loop
          </h1>
          <p className="text-sm tracking-[0.3em] text-stone-600">LA BOTTEGA DEL TEMPO</p>
        </div>

        <Sprite id={current.sprite} size={128} className="drop-shadow-[0_0_28px_rgba(180,120,40,0.35)]" />

        <p className="min-h-[7rem] text-[15px] leading-relaxed text-stone-300">{current.text}</p>

        <div className="flex gap-1.5">
          {BEATS.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-6 rounded-full transition ${
                index === beat ? 'bg-amber-400' : 'bg-stone-800'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full max-w-md flex-col gap-3">
        <button
          type="button"
          onClick={() => (isLast ? dismissIntro() : setBeat((value) => value + 1))}
          className="w-full rounded-xl border-2 border-amber-500 bg-amber-600/25 px-6 py-3.5 text-base font-semibold text-amber-100 transition active:scale-[0.98] hover:bg-amber-600/40"
        >
          {isLast ? 'Apri la bottega' : 'Avanti'}
        </button>
        {!isLast && (
          <button
            type="button"
            onClick={dismissIntro}
            className="text-xs text-stone-600 transition hover:text-stone-400"
          >
            salta l'introduzione
          </button>
        )}
      </div>
    </div>
  );
};
