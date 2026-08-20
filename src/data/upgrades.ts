import type { CrateDefinition, UpgradeDefinition } from '../types/game';

/**
 * Il negozio di A.R.I.A. Ogni voce spinge su una leva diversa del loop,
 * così la scelta di cosa comprare resta interessante invece di essere ovvia.
 */
export const UPGRADES: readonly UpgradeDefinition[] = [
  {
    id: 'lente',
    name: "Lente d'Ingrandimento Magica",
    description: 'Ogni tap manuale vale di più. La leva della fase attiva.',
    sprite: 'ingranaggio_precisione',
    kind: 'tapPower',
    baseCost: 10,
    costCurrency: 'essenza',
    costGrowth: 1.15,
    effectPerUnit: 1,
    unlockAtTotalEssence: 0,
  },
  {
    id: 'apprendista',
    name: 'Apprendista Spirituale',
    description: 'Lavora al banco anche quando non ci sei: +0.5 tap al secondo.',
    sprite: 'antiquario',
    kind: 'autoTaps',
    baseCost: 45,
    costCurrency: 'essenza',
    costGrowth: 1.18,
    effectPerUnit: 0.5,
    unlockAtTotalEssence: 30,
  },
  {
    id: 'filtro',
    name: 'Filtro del Tempo',
    description: 'La Polvere si rigenera più in fretta: meno pause forzate.',
    sprite: 'filtro_tempo',
    kind: 'dustRegen',
    baseCost: 80,
    costCurrency: 'essenza',
    costGrowth: 1.21,
    effectPerUnit: 0.9,
    unlockAtTotalEssence: 120,
  },
  {
    id: 'lingotto',
    name: 'Lingotto di Bronzo Corroso',
    description: 'Fonde meglio i residui: +8% a essenza e monete per restauro.',
    sprite: 'lingotto_bronzo',
    kind: 'valueBonus',
    baseCost: 240,
    costCurrency: 'monete',
    costGrowth: 1.27,
    effectPerUnit: 0.08,
    unlockAtTotalEssence: 400,
  },
  {
    id: 'sacerdote',
    name: 'Offerta ai Silenti',
    description: 'Una donazione discreta rallenta del 6% la crescita della Pressione.',
    sprite: 'sacerdote',
    kind: 'pressureDamp',
    baseCost: 500,
    costCurrency: 'monete',
    costGrowth: 1.35,
    effectPerUnit: 0.06,
    maxOwned: 10,
    unlockAtTotalEssence: 1_500,
  },
  {
    id: 'aria_core',
    name: 'Nucleo di A.R.I.A.',
    description: "Sovralimenta l'automazione: +2 tap al secondo, ma costa caro.",
    sprite: 'aria',
    kind: 'autoTaps',
    baseCost: 4_000,
    costCurrency: 'essenza',
    costGrowth: 1.42,
    effectPerUnit: 2,
    unlockAtTotalEssence: 8_000,
  },
] as const;

export const UPGRADES_BY_ID: Readonly<Record<string, UpgradeDefinition>> = Object.freeze(
  Object.fromEntries(UPGRADES.map((upgrade) => [upgrade.id, upgrade])),
);

export const CRATES: readonly CrateDefinition[] = [
  {
    id: 'cassa_polverosa',
    name: 'Cassa Polverosa',
    description: 'Roba di recupero. Ogni tanto scappa qualcosa di buono.',
    cost: 120,
    costCurrency: 'monete',
    rarityBias: { comune: 0, raro: 0, epico: 0, leggendario: 0 },
  },
  {
    id: 'cassa_sigillata',
    name: 'Cassa Sigillata',
    description: 'Il Mercante giura di non averla aperta. Probabilmente mente.',
    cost: 750,
    costCurrency: 'monete',
    rarityBias: { comune: -30, raro: 12, epico: 10, leggendario: 4 },
  },
  {
    id: 'cassa_proibita',
    name: 'Cassa Proibita',
    description: "Pagata in Frammenti. L'Ordine ucciderebbe per sapere cosa contiene.",
    cost: 2,
    costCurrency: 'frammenti',
    rarityBias: { comune: -55, raro: -10, epico: 26, leggendario: 22 },
  },
] as const;

export const CRATES_BY_ID: Readonly<Record<string, CrateDefinition>> = Object.freeze(
  Object.fromEntries(CRATES.map((crate) => [crate.id, crate])),
);
