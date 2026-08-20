import {
  PRESTIGE_BONUS_PER_SHARD,
  PRESTIGE_EXPONENT,
  PRESTIGE_THRESHOLD,
} from '../data/balance';

/** Costo del prossimo livello di un potenziamento con crescita geometrica. */
export const upgradeCost = (baseCost: number, growth: number, owned: number): number =>
  Math.ceil(baseCost * Math.pow(growth, owned));

/**
 * Costo totale per comprare `count` livelli partendo da `owned`.
 * Somma di serie geometrica: evita un ciclo quando si compra x10 / max.
 */
export const bulkUpgradeCost = (
  baseCost: number,
  growth: number,
  owned: number,
  count: number,
): number => {
  if (count <= 0) return 0;
  if (growth === 1) return Math.ceil(baseCost * count);
  const first = baseCost * Math.pow(growth, owned);
  return Math.ceil((first * (Math.pow(growth, count) - 1)) / (growth - 1));
};

/** Quanti livelli sono acquistabili con `budget`, al massimo `limit`. */
export const affordableLevels = (
  baseCost: number,
  growth: number,
  owned: number,
  budget: number,
  limit: number,
): number => {
  let count = 0;
  let spent = 0;
  while (count < limit) {
    const next = upgradeCost(baseCost, growth, owned + count);
    if (spent + next > budget) break;
    spent += next;
    count += 1;
  }
  return count;
};

/** Frammenti di Eternità ottenibili prestigiando ora. */
export const shardsFromEssence = (lifetimeEssence: number): number => {
  if (lifetimeEssence < PRESTIGE_THRESHOLD) return 0;
  return Math.floor(Math.pow(lifetimeEssence / PRESTIGE_THRESHOLD, PRESTIGE_EXPONENT));
};

export const prestigeMultiplier = (shards: number): number =>
  1 + shards * PRESTIGE_BONUS_PER_SHARD;

export const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value;

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
