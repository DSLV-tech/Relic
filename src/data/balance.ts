/**
 * Costanti di bilanciamento. Tutte in un solo file: cambiare qui e ricaricare
 * è l'unico modo sano per iterare su un incremental.
 */

export const TICK_MS = 100 as const;
/** Oltre questa soglia si assume che la scheda sia stata sospesa. */
export const MAX_TICK_DELTA_MS = 1_000 as const;
/** Il progresso offline si accumula al massimo per 8 ore. */
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1_000;
/** L'automazione rende meno quando il gioco è chiuso: è la carota per rientrare. */
export const OFFLINE_EFFICIENCY = 0.55;

export const BASE_TAP_POWER = 1;
export const BASE_DUST_REGEN = 1.5;
export const DUST_CAP_BASE = 120;
export const DUST_CAP_PER_PRESTIGE = 40;

/** Pressione guadagnata per punto di essenza generata. */
export const PRESSURE_PER_ESSENCE = 0.000055;
/** Decadimento naturale al secondo quando non si produce. */
export const PRESSURE_DECAY_PER_SEC = 0.00035;
export const PRESSURE_SUSPICION = 0.45;
export const PRESSURE_VISIT = 0.75;
/** Durata della fase in cui bisogna nascondere gli artefatti. */
export const HIDE_WINDOW_MS = 12_000;
/** Penalità se la perquisizione va a segno. */
export const RAID_ESSENCE_LOSS = 0.4;
export const RAID_COIN_LOSS = 0.6;

/** Essenza totale necessaria per il primo Frammento di Eternità. */
export const PRESTIGE_THRESHOLD = 25_000;
export const PRESTIGE_EXPONENT = 0.55;
/** Ogni frammento aggiunge questa frazione al moltiplicatore globale. */
export const PRESTIGE_BONUS_PER_SHARD = 0.14;

/** Conversione di una reliquia duplicata in essenza. */
export const DUPLICATE_REFUND_BASE = 45;
