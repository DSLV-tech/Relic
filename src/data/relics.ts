import type { RarityMeta, Rarity, RelicDefinition, ResourceMeta } from '../types/game';

export const RESOURCES: readonly ResourceMeta[] = [
  {
    id: 'polvere',
    label: 'Polvere',
    short: 'Polvere',
    sprite: 'polvere',
    hint: 'Consumata da ogni tap. Si rigenera da sola: è il freno naturale al click frenetico.',
    persistsThroughPrestige: false,
  },
  {
    id: 'essenza',
    label: 'Essenza Temporale',
    short: 'Essenza',
    sprite: 'particella_essenza',
    hint: 'Rilasciata dalle reliquie restaurate. Compra Apprendisti e potenziamenti.',
    persistsThroughPrestige: false,
  },
  {
    id: 'monete',
    label: 'Monete del Tempo',
    short: 'Monete',
    sprite: 'moneta',
    hint: 'Valuta del Mercato Nero: serve per le Casse Misteriose.',
    persistsThroughPrestige: false,
  },
  {
    id: 'frammenti',
    label: 'Frammenti di Eternità',
    short: 'Eternità',
    sprite: 'frammento_eternita',
    hint: 'Sopravvivono al salto temporale e moltiplicano ogni partita successiva.',
    persistsThroughPrestige: true,
  },
] as const;

export const RARITIES: Readonly<Record<Rarity, RarityMeta>> = {
  comune: {
    id: 'comune',
    label: 'Comune',
    tone: 'text-stone-300 border-stone-600',
    glow: 'shadow-[0_0_0_1px_rgba(168,162,158,0.25)]',
    weight: 62,
    valueMultiplier: 1,
  },
  raro: {
    id: 'raro',
    label: 'Raro',
    tone: 'text-teal-300 border-teal-600',
    glow: 'shadow-[0_0_18px_-4px_rgba(45,212,191,0.55)]',
    weight: 26,
    valueMultiplier: 2.6,
  },
  epico: {
    id: 'epico',
    label: 'Epico',
    tone: 'text-violet-300 border-violet-500',
    glow: 'shadow-[0_0_22px_-3px_rgba(167,139,250,0.6)]',
    weight: 9,
    valueMultiplier: 7.5,
  },
  leggendario: {
    id: 'leggendario',
    label: 'Leggendario',
    tone: 'text-amber-300 border-amber-400',
    glow: 'shadow-[0_0_28px_-2px_rgba(251,191,36,0.75)]',
    weight: 3,
    valueMultiplier: 22,
  },
} as const;

export const RARITY_ORDER: readonly Rarity[] = ['comune', 'raro', 'epico', 'leggendario'];

export const RELICS: readonly RelicDefinition[] = [
  {
    id: 'pugnale',
    name: 'Pugnale Arrugginito',
    restoredName: 'Pugnale da Collezione',
    rarity: 'comune',
    spriteBroken: 'pugnale_arrugginito',
    spriteRestored: 'pugnale_collezione',
    baseWork: 8,
    baseEssence: 6,
    baseCoins: 3,
    dustPerTap: 1,
    loreId: 'lama-del-fabbro',
  },
  {
    id: 'mappa',
    name: 'Mappa Sbiadita',
    restoredName: 'Mappa Antica dei Ricordi',
    rarity: 'raro',
    spriteBroken: 'mappa_sbiadita',
    spriteRestored: 'mappa_antica',
    baseWork: 38,
    baseEssence: 26,
    baseCoins: 9,
    dustPerTap: 2,
    loreId: 'rotta-verso-nord',
  },
  {
    id: 'orologio',
    name: 'Orologio da Taschino Rotto',
    restoredName: "Orologio d'Eternità",
    rarity: 'epico',
    spriteBroken: 'orologio_rotto',
    spriteRestored: 'orologio_eternita',
    baseWork: 170,
    baseEssence: 140,
    baseCoins: 44,
    dustPerTap: 3,
    loreId: 'il-primo-ricordo',
  },
  {
    id: 'tomo',
    name: 'Libro Bruciato',
    restoredName: "Tomo dell'Iniziazione",
    rarity: 'leggendario',
    spriteBroken: 'libro_bruciato',
    spriteRestored: 'tomo_iniziazione',
    baseWork: 820,
    baseEssence: 820,
    baseCoins: 260,
    dustPerTap: 5,
    loreId: 'la-mano-di-elias',
  },
] as const;

export const RELICS_BY_ID: Readonly<Record<string, RelicDefinition>> = Object.freeze(
  Object.fromEntries(RELICS.map((relic) => [relic.id, relic])),
);

export const RELICS_BY_RARITY: Readonly<Record<Rarity, readonly RelicDefinition[]>> = Object.freeze(
  RARITY_ORDER.reduce<Record<Rarity, RelicDefinition[]>>(
    (acc, rarity) => {
      acc[rarity] = RELICS.filter((relic) => relic.rarity === rarity);
      return acc;
    },
    { comune: [], raro: [], epico: [], leggendario: [] },
  ),
);

/** La reliquia con cui inizia ogni partita (e ogni ciclo dopo il prestigio). */
export const STARTER_RELIC_ID = 'pugnale' as const;
