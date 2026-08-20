import type { Rarity } from '../types/game';

/**
 * Mulberry32: PRNG deterministico e minuscolo.
 * Un seed esplicito rende le estrazioni riproducibili nei test.
 */
export const createRng = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

/** Estrazione pesata su una mappa rarità → peso. */
export const pickWeighted = (
  weights: Readonly<Record<Rarity, number>>,
  random: () => number,
): Rarity => {
  const entries = Object.entries(weights) as ReadonlyArray<[Rarity, number]>;
  const total = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);
  if (total <= 0) return 'comune';
  let roll = random() * total;
  for (const [rarity, weight] of entries) {
    roll -= Math.max(0, weight);
    if (roll <= 0) return rarity;
  }
  return entries[entries.length - 1][0];
};

export const pickOne = <T,>(items: readonly T[], random: () => number): T =>
  items[Math.floor(random() * items.length)];
