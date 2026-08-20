/**
 * Audio sintetizzato con WebAudio: zero file da scaricare, zero licenze, e il
 * suono può reagire allo stato di gioco (il tono del tap sale con la combo,
 * cosa impossibile con un campione fisso).
 */

export type SoundId = 'tap' | 'crit' | 'restore' | 'purchase' | 'alert' | 'prestige';

let context: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

/**
 * I browser rifiutano di suonare prima di un'interazione: il contesto va creato
 * pigramente, al primo tocco reale del giocatore.
 */
const ensureContext = (): AudioContext | null => {
  if (context) {
    if (context.state === 'suspended') void context.resume();
    return context;
  }
  if (typeof window === 'undefined') return null;
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  context = new Ctor();
  master = context.createGain();
  master.gain.value = 0.32;
  master.connect(context.destination);
  return context;
};

interface ToneOptions {
  readonly freq: number;
  readonly duration: number;
  readonly type?: OscillatorType;
  readonly gain?: number;
  readonly delay?: number;
  /** Frequenza finale per un glissando. */
  readonly sweepTo?: number;
}

const tone = ({
  freq,
  duration,
  type = 'triangle',
  gain = 0.5,
  delay = 0,
  sweepTo,
}: ToneOptions): void => {
  const ctx = ensureContext();
  if (!ctx || !master) return;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (sweepTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), start + duration);
  }

  // Attacco quasi istantaneo e rilascio esponenziale: è quello che rende un
  // blip "secco" invece di "molle".
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(env);
  env.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
};

/** Rumore breve filtrato: dà "corpo" al critico senza campioni. */
const noiseBurst = (duration: number, gain: number): void => {
  const ctx = ensureContext();
  if (!ctx || !master) return;

  const frames = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1_800;
  const env = ctx.createGain();
  env.gain.value = gain;

  source.connect(filter);
  filter.connect(env);
  env.connect(master);
  source.start();
};

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0] as const;

export const playSound = (id: SoundId, combo = 0): void => {
  if (muted) return;

  switch (id) {
    case 'tap': {
      // Il tono sale con la combo: il giocatore *sente* che sta andando bene.
      const step = Math.min(combo, 24);
      const freq = 196 * Math.pow(2, step / 24);
      tone({ freq, duration: 0.055, type: 'square', gain: 0.16 });
      break;
    }
    case 'crit':
      tone({ freq: 880, duration: 0.09, type: 'sawtooth', gain: 0.3, sweepTo: 1_760 });
      tone({ freq: 440, duration: 0.16, type: 'triangle', gain: 0.22, delay: 0.02 });
      noiseBurst(0.09, 0.16);
      break;
    case 'restore':
      // Arpeggio ascendente: la ricompensa deve suonare come una ricompensa.
      PENTATONIC.slice(0, 4).forEach((freq, index) => {
        tone({ freq, duration: 0.14, type: 'triangle', gain: 0.24, delay: index * 0.045 });
      });
      break;
    case 'purchase':
      tone({ freq: 392, duration: 0.09, type: 'triangle', gain: 0.24 });
      tone({ freq: 587.33, duration: 0.14, type: 'triangle', gain: 0.22, delay: 0.07 });
      break;
    case 'alert':
      tone({ freq: 220, duration: 0.22, type: 'sawtooth', gain: 0.24, sweepTo: 110 });
      tone({ freq: 210, duration: 0.22, type: 'sawtooth', gain: 0.2, delay: 0.26, sweepTo: 105 });
      break;
    case 'prestige':
      [261.63, 329.63, 392.0, 523.25, 659.25, 783.99].forEach((freq, index) => {
        tone({ freq, duration: 0.4, type: 'triangle', gain: 0.2, delay: index * 0.07 });
      });
      break;
  }
};

export const setMuted = (value: boolean): void => {
  muted = value;
  if (master) master.gain.value = value ? 0 : 0.32;
};

export const isMuted = (): boolean => muted;

/** Da chiamare al primo gesto: sblocca l'audio su iOS. */
export const unlockAudio = (): void => {
  ensureContext();
};
