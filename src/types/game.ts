/**
 * Relic Loop — La Bottega del Tempo
 * Modello di dominio. Nessun `any`: ogni confine del sistema è tipizzato.
 */

// ─────────────────────────────────────────────────────────── Risorse

/** Le quattro valute del gioco. L'ordine è quello di visualizzazione nella HUD. */
export type ResourceId = 'polvere' | 'essenza' | 'monete' | 'frammenti';

export type Resources = Readonly<Record<ResourceId, number>>;

export interface ResourceMeta {
  readonly id: ResourceId;
  readonly label: string;
  /** Versione corta per la HUD mobile, dove lo spazio è ~90 px per chip. */
  readonly short: string;
  readonly sprite: SpriteId;
  /** Descrizione mostrata nel tooltip. */
  readonly hint: string;
  /** I frammenti sopravvivono al prestigio, le altre risorse no. */
  readonly persistsThroughPrestige: boolean;
}

// ─────────────────────────────────────────────────────────── Sprite

/** Chiavi degli sprite generati in Affinity. Stringhe letterali: un typo non compila. */
export type SpriteId =
  | 'antiquario' | 'aria' | 'ispettore' | 'mercante' | 'sacerdote' | 'zio_tobia'
  | 'pugnale_arrugginito' | 'pugnale_collezione'
  | 'mappa_sbiadita' | 'mappa_antica'
  | 'orologio_rotto' | 'orologio_eternita'
  | 'libro_bruciato' | 'tomo_iniziazione'
  | 'filtro_tempo' | 'lingotto_bronzo' | 'cuore' | 'fulmine' | 'moneta'
  | 'frammento_eternita' | 'slot_inventario' | 'bottone_pausa' | 'bottone_settings'
  | 'ingranaggio_precisione' | 'contatore' | 'barra_vuota' | 'barra_piena'
  | 'particella_essenza' | 'scintilla_oro' | 'vortice_temporale' | 'polvere';

export type SpriteGroup = 'personaggi' | 'oggetti' | 'ui';

// ─────────────────────────────────────────────────────────── Reliquie

export type Rarity = 'comune' | 'raro' | 'epico' | 'leggendario';

export interface RarityMeta {
  readonly id: Rarity;
  readonly label: string;
  /** Classe Tailwind del bordo/testo, così la rarità ha un solo punto di verità. */
  readonly tone: string;
  readonly glow: string;
  /** Peso relativo nell'estrazione dalle Casse Misteriose. */
  readonly weight: number;
  /** Moltiplicatore applicato a essenza e monete del restauro. */
  readonly valueMultiplier: number;
}

/** Definizione statica di una reliquia: non cambia mai a runtime. */
export interface RelicDefinition {
  readonly id: string;
  readonly name: string;
  readonly restoredName: string;
  readonly rarity: Rarity;
  readonly spriteBroken: SpriteId;
  readonly spriteRestored: SpriteId;
  /** Tap "puri" necessari al restauro, prima dei moltiplicatori. */
  readonly baseWork: number;
  readonly baseEssence: number;
  readonly baseCoins: number;
  /** Polvere consumata da ogni tap su questa reliquia. */
  readonly dustPerTap: number;
  /** Frammento di trama sbloccato al primo restauro, se presente. */
  readonly loreId?: string;
}

/** Stato mutabile di una reliquia posseduta. */
export interface RelicInstance {
  readonly definitionId: string;
  /** Lavoro accumulato sulla reliquia corrente. */
  readonly work: number;
  readonly restored: boolean;
  /** Quante volte il giocatore ha restaurato questa reliquia in totale. */
  readonly restoreCount: number;
}

// ─────────────────────────────────────────────────────────── Potenziamenti

/** Cosa modifica un potenziamento. Discrimina l'unione `UpgradeEffect`. */
export type UpgradeKind = 'tapPower' | 'autoTaps' | 'dustRegen' | 'valueBonus' | 'pressureDamp';

export interface UpgradeDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sprite: SpriteId;
  readonly kind: UpgradeKind;
  readonly baseCost: number;
  readonly costCurrency: Extract<ResourceId, 'essenza' | 'monete'>;
  /** Crescita geometrica del costo: cost = baseCost * growth^owned. */
  readonly costGrowth: number;
  /** Contributo additivo per unità posseduta. */
  readonly effectPerUnit: number;
  readonly maxOwned?: number;
  /** Sbloccato solo quando il totale di essenza generata supera questa soglia. */
  readonly unlockAtTotalEssence: number;
}

export type UpgradeLevels = Readonly<Record<string, number>>;

// ─────────────────────────────────────────────────────────── Gacha

export interface CrateDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  readonly costCurrency: Extract<ResourceId, 'monete' | 'frammenti'>;
  /** Bonus additivo ai pesi di rarità: casse migliori pescano meglio. */
  readonly rarityBias: Readonly<Record<Rarity, number>>;
}

export interface CrateResult {
  readonly relicId: string;
  readonly rarity: Rarity;
  readonly duplicate: boolean;
  /** Essenza di conversione se la reliquia era già posseduta. */
  readonly refund: number;
  readonly loreUnlocked?: string;
}

// ─────────────────────────────────────────────────────────── Narrativa

export type LoreSource = 'aria' | 'elias' | 'ispettore' | 'ordine';

export interface LoreFragment {
  readonly id: string;
  readonly title: string;
  readonly source: LoreSource;
  readonly body: string;
  /** Sbloccato automaticamente quando questa condizione diventa vera. */
  readonly unlockAtTotalEssence?: number;
}

// ─────────────────────────────────────────────────────────── Pressione / Ispettore

export type InspectorPhase = 'calmo' | 'sospetto' | 'visita' | 'perquisizione';

export interface InspectorState {
  /** 0 → 1. A 1 scatta la perquisizione. */
  readonly pressure: number;
  readonly phase: InspectorPhase;
  /** Timestamp ms della prossima visita; null se nessuna programmata. */
  readonly nextVisitAt: number | null;
  /** Vero mentre il giocatore deve nascondere gli artefatti. */
  readonly hiding: boolean;
  readonly visitsSurvived: number;
}

// ─────────────────────────────────────────────────────────── Stato di gioco

export interface DerivedStats {
  /** Lavoro prodotto da un singolo tap manuale. */
  readonly tapPower: number;
  /** Tap automatici al secondo dagli Apprendisti. */
  readonly tapsPerSecond: number;
  /** Polvere rigenerata al secondo. */
  readonly dustPerSecond: number;
  /** Moltiplicatore su essenza e monete (potenziamenti × prestigio). */
  readonly valueMultiplier: number;
  /** Riduzione della velocità di accumulo della Pressione, 0 → 1. */
  readonly pressureDamping: number;
  readonly prestigeMultiplier: number;
}

export interface GameSnapshot {
  readonly resources: Resources;
  readonly relics: Readonly<Record<string, RelicInstance>>;
  readonly activeRelicId: string | null;
  readonly upgrades: UpgradeLevels;
  readonly inspector: InspectorState;
  readonly unlockedLore: readonly string[];
  readonly totalEssenceEarned: number;
  readonly lifetimeEssence: number;
  readonly prestigeCount: number;
  readonly lastTickAt: number;
  readonly startedAt: number;
}

export interface OfflineReport {
  readonly elapsedMs: number;
  readonly essenceGained: number;
  readonly relicsRestored: number;
  readonly cappedByDust: boolean;
}

// ─────────────────────────────────────────────────────────── Obiettivi

/** Sezione dell'interfaccia da evidenziare mentre un obiettivo è attivo. */
export type QuestTarget = 'banco' | 'bottega' | 'mercato' | 'archivio';

/**
 * Vista ridotta e piatta dello stato, passata ai predicati degli obiettivi.
 * Tenerla separata da `GameSnapshot` evita che una quest possa leggere (o
 * peggio, mutare) parti di stato che non la riguardano.
 */
export interface GameProgressView {
  readonly totalTaps: number;
  readonly totalRestores: number;
  readonly cratesOpened: number;
  readonly relicsOwned: number;
  readonly activeRelicId: string;
  readonly upgrades: UpgradeLevels;
  readonly lifetimeEssence: number;
  readonly prestigeCount: number;
  readonly pressure: number;
  readonly loreOpened: boolean;
}

export interface Quest {
  readonly id: string;
  /** Cosa deve fare il giocatore, all'imperativo. */
  readonly title: string;
  /** Perché conviene farlo. */
  readonly hint: string;
  /** La battuta di A.R.I.A. che accompagna l'obiettivo. */
  readonly aria: string;
  readonly target: QuestTarget;
  readonly goal: number;
  readonly progress: (view: GameProgressView) => number;
  readonly check: (view: GameProgressView) => boolean;
}

export type ToastKind = 'info' | 'success' | 'warning' | 'lore';

export interface Toast {
  readonly id: string;
  readonly kind: ToastKind;
  readonly title: string;
  readonly body?: string;
  readonly sprite?: SpriteId;
  readonly createdAt: number;
}
