import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import {
  BASE_DUST_REGEN,
  BASE_TAP_POWER,
  DUPLICATE_REFUND_BASE,
  DUST_CAP_BASE,
  DUST_CAP_PER_PRESTIGE,
  HIDE_WINDOW_MS,
  OFFLINE_CAP_MS,
  OFFLINE_EFFICIENCY,
  PRESSURE_DECAY_PER_SEC,
  PRESSURE_PER_ESSENCE,
  PRESSURE_SUSPICION,
  PRESSURE_VISIT,
  RAID_COIN_LOSS,
  RAID_ESSENCE_LOSS,
} from '../data/balance';
import { LORE, LORE_BY_ID } from '../data/lore';
import { nextQuest } from '../data/quests';
import { RARITIES, RELICS, RELICS_BY_ID, STARTER_RELIC_ID } from '../data/relics';
import { CRATES_BY_ID, UPGRADES, UPGRADES_BY_ID } from '../data/upgrades';
import { clamp, prestigeMultiplier, shardsFromEssence, upgradeCost } from '../lib/math';
import { createRng, pickOne, pickWeighted } from '../lib/rng';
import type {
  CrateResult,
  DerivedStats,
  GameProgressView,
  Quest,
  InspectorPhase,
  InspectorState,
  OfflineReport,
  Rarity,
  RelicInstance,
  Resources,
  Toast,
  ToastKind,
  UpgradeLevels,
} from '../types/game';

// ─────────────────────────────────────────────────────────── Forma dello store

interface GameState {
  resources: Resources;
  relics: Record<string, RelicInstance>;
  activeRelicId: string;
  upgrades: UpgradeLevels;
  inspector: InspectorState;
  unlockedLore: string[];
  toasts: Toast[];
  /** Ricalcolato solo quando cambiano potenziamenti o prestigio, non ad ogni tick. */
  derived: DerivedStats;
  totalEssenceEarned: number;
  lifetimeEssence: number;
  prestigeCount: number;
  totalTaps: number;
  totalRestores: number;
  cratesOpened: number;
  /** Il giocatore ha aperto almeno un ricordo dall'Archivio. */
  loreOpened: boolean;
  /** L'introduzione narrativa è già stata vista. */
  introSeen: boolean;
  completedQuests: string[];
  lastSeenAt: number;
  startedAt: number;
  /** Report del progresso offline, consumato e azzerato dalla UI. */
  offlineReport: OfflineReport | null;
  lastCrateResult: CrateResult | null;
  hydrated: boolean;
}

interface GameActions {
  tick: (deltaMs: number) => void;
  tap: () => void;
  selectRelic: (relicId: string) => void;
  buyUpgrade: (upgradeId: string, count?: number) => void;
  openCrate: (crateId: string) => CrateResult | null;
  clearCrateResult: () => void;
  hideArtifacts: () => void;
  prestige: () => void;
  dismissToast: (toastId: string) => void;
  dismissIntro: () => void;
  markLoreOpened: () => void;
  clearOfflineReport: () => void;
  applyOfflineProgress: () => void;
  resetGame: () => void;
}

export type GameStore = GameState & GameActions;

// ─────────────────────────────────────────────────────────── Stato iniziale

const initialResources: Resources = { polvere: 60, essenza: 0, monete: 0, frammenti: 0 };

const makeRelicInstance = (definitionId: string): RelicInstance => ({
  definitionId,
  work: 0,
  restored: false,
  restoreCount: 0,
});

const initialInspector: InspectorState = {
  pressure: 0,
  phase: 'calmo',
  nextVisitAt: null,
  hiding: false,
  visitsSurvived: 0,
};

/**
 * Le statistiche derivate sono una funzione pura di potenziamenti + frammenti.
 * Tenerla pura permette di riusarla per il progresso offline e per i test.
 */
export const computeDerived = (upgrades: UpgradeLevels, shards: number): DerivedStats => {
  let tapPower = BASE_TAP_POWER;
  let tapsPerSecond = 0;
  let dustPerSecond = BASE_DUST_REGEN;
  let valueBonus = 0;
  let pressureDamping = 0;

  for (const upgrade of UPGRADES) {
    const owned = upgrades[upgrade.id] ?? 0;
    if (owned <= 0) continue;
    const total = upgrade.effectPerUnit * owned;
    switch (upgrade.kind) {
      case 'tapPower':
        tapPower += total;
        break;
      case 'autoTaps':
        tapsPerSecond += total;
        break;
      case 'dustRegen':
        dustPerSecond += total;
        break;
      case 'valueBonus':
        valueBonus += total;
        break;
      case 'pressureDamp':
        pressureDamping += total;
        break;
    }
  }

  const prestige = prestigeMultiplier(shards);
  return {
    tapPower: tapPower * prestige,
    tapsPerSecond,
    dustPerSecond,
    valueMultiplier: (1 + valueBonus) * prestige,
    pressureDamping: clamp(pressureDamping, 0, 0.75),
    prestigeMultiplier: prestige,
  };
};

const dustCap = (prestigeCount: number): number =>
  DUST_CAP_BASE + prestigeCount * DUST_CAP_PER_PRESTIGE;

const phaseFor = (pressure: number, hiding: boolean): InspectorPhase => {
  if (hiding) return 'visita';
  if (pressure >= PRESSURE_VISIT) return 'perquisizione';
  if (pressure >= PRESSURE_SUSPICION) return 'sospetto';
  return 'calmo';
};

let toastSeq = 0;
const makeToast = (
  kind: ToastKind,
  title: string,
  body?: string,
  sprite?: Toast['sprite'],
): Toast => ({
  id: `t${++toastSeq}`,
  kind,
  title,
  body,
  sprite,
  createdAt: Date.now(),
});

/** Proiezione piatta dello stato per i predicati degli obiettivi. */
export const toProgressView = (state: GameState): GameProgressView => ({
  totalTaps: state.totalTaps,
  totalRestores: state.totalRestores,
  cratesOpened: state.cratesOpened,
  relicsOwned: Object.keys(state.relics).length,
  activeRelicId: state.activeRelicId,
  upgrades: state.upgrades,
  lifetimeEssence: state.lifetimeEssence,
  prestigeCount: state.prestigeCount,
  pressure: state.inspector.pressure,
  loreOpened: state.loreOpened,
});

export const currentQuest = (state: GameState): Quest | undefined =>
  nextQuest(state.completedQuests);

/**
 * Mantiene la coda corta. Al primo restauro possono scattare tre notifiche
 * insieme (oggetto, obiettivo, ricordo): su un telefono coprirebbero il banco.
 */
const pushToast = (toasts: Toast[], toast: Toast): Toast[] => [...toasts, toast].slice(-3);

// ─────────────────────────────────────────────────────────── Motore di simulazione

interface WorkOutcome {
  readonly relic: RelicInstance;
  readonly essence: number;
  readonly coins: number;
  readonly restores: number;
  readonly loreUnlocked: string | null;
}

/**
 * Applica `work` punti di lavoro a una reliquia, gestendo i restauri a catena.
 * Estratta dallo store perché è la stessa logica usata dal progresso offline.
 */
const applyWork = (
  relic: RelicInstance,
  work: number,
  valueMultiplier: number,
): WorkOutcome => {
  const definition = RELICS_BY_ID[relic.definitionId];
  if (!definition) {
    return { relic, essence: 0, coins: 0, restores: 0, loreUnlocked: null };
  }

  const rarity = RARITIES[definition.rarity];
  // Ogni restauro successivo della stessa reliquia costa il 12% in più: la
  // progressione resta ripida senza bloccare il giocatore su un solo oggetto.
  let current = relic;
  let essence = 0;
  let coins = 0;
  let restores = 0;
  let pool = current.work + work;
  let loreUnlocked: string | null = null;

  for (let guard = 0; guard < 512; guard += 1) {
    const required = definition.baseWork * Math.pow(1.12, current.restoreCount);
    if (pool < required) break;
    pool -= required;
    restores += 1;
    essence += definition.baseEssence * rarity.valueMultiplier * valueMultiplier;
    coins += definition.baseCoins * rarity.valueMultiplier * valueMultiplier;
    if (current.restoreCount === 0 && definition.loreId) loreUnlocked = definition.loreId;
    current = {
      ...current,
      restoreCount: current.restoreCount + 1,
      restored: true,
    };
  }

  return {
    relic: { ...current, work: pool },
    essence,
    coins,
    restores,
    loreUnlocked,
  };
};

// ─────────────────────────────────────────────────────────── Store

const createInitialState = (carryShards: number, prestigeCount: number): GameState => ({
  resources: { ...initialResources, frammenti: carryShards },
  relics: { [STARTER_RELIC_ID]: makeRelicInstance(STARTER_RELIC_ID) },
  activeRelicId: STARTER_RELIC_ID,
  upgrades: {},
  inspector: initialInspector,
  unlockedLore: ['benvenuto'],
  toasts: [],
  derived: computeDerived({}, carryShards),
  totalEssenceEarned: 0,
  lifetimeEssence: 0,
  prestigeCount,
  totalTaps: 0,
  totalRestores: 0,
  cratesOpened: 0,
  loreOpened: false,
  introSeen: false,
  completedQuests: [],
  lastSeenAt: Date.now(),
  startedAt: Date.now(),
  offlineReport: null,
  lastCrateResult: null,
  hydrated: false,
});

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(0, 0),

      // ─── Loop
      tick: (deltaMs) => {
        const seconds = deltaMs / 1_000;
        const state = get();
        const { derived, inspector } = state;

        const cap = dustCap(state.prestigeCount);
        let polvere = Math.min(cap, state.resources.polvere + derived.dustPerSecond * seconds);

        let essenza = state.resources.essenza;
        let monete = state.resources.monete;
        let relics = state.relics;
        let totalRestores = state.totalRestores;
        let earned = 0;
        let newLore: string | null = null;

        // Automazione: gli Apprendisti consumano polvere come il giocatore.
        const autoTaps = derived.tapsPerSecond * seconds;
        if (autoTaps > 0) {
          const active = state.relics[state.activeRelicId];
          const definition = active ? RELICS_BY_ID[active.definitionId] : undefined;
          if (active && definition) {
            const affordable = Math.min(autoTaps, polvere / definition.dustPerTap);
            if (affordable > 0) {
              polvere -= affordable * definition.dustPerTap;
              const outcome = applyWork(
                active,
                affordable * derived.tapPower,
                derived.valueMultiplier,
              );
              if (outcome.restores > 0) {
                essenza += outcome.essence;
                monete += outcome.coins;
                earned += outcome.essence;
                totalRestores += outcome.restores;
                newLore = outcome.loreUnlocked;
              }
              relics = { ...relics, [active.definitionId]: outcome.relic };
            }
          }
        }

        // Pressione: sale con l'essenza prodotta, scende da sola nei momenti di calma.
        const damp = 1 - derived.pressureDamping;
        let pressure = inspector.pressure + earned * PRESSURE_PER_ESSENCE * damp;
        pressure -= PRESSURE_DECAY_PER_SEC * seconds;
        pressure = clamp(pressure, 0, 1);

        let nextInspector: InspectorState = inspector;
        let toasts = state.toasts;
        const now = Date.now();

        if (inspector.hiding && inspector.nextVisitAt !== null && now >= inspector.nextVisitAt) {
          // Finestra scaduta: la perquisizione va a segno.
          essenza *= 1 - RAID_ESSENCE_LOSS;
          monete *= 1 - RAID_COIN_LOSS;
          pressure = 0.2;
          nextInspector = {
            ...inspector,
            hiding: false,
            nextVisitAt: null,
            pressure,
            phase: 'calmo',
          };
          toasts = pushToast(
            toasts,
            makeToast(
              'warning',
              'Perquisizione!',
              "L'Ispettore ha sequestrato parte della bottega. Hai perso essenza e monete.",
              'ispettore',
            ),
          );
        } else if (!inspector.hiding && pressure >= 1) {
          nextInspector = {
            ...inspector,
            pressure,
            hiding: true,
            phase: 'visita',
            nextVisitAt: now + HIDE_WINDOW_MS,
          };
          toasts = pushToast(
            toasts,
            makeToast(
              'warning',
              "L'Ispettore è alla porta",
              'Nascondi gli artefatti prima che entri.',
              'ispettore',
            ),
          );
        } else {
          nextInspector = {
            ...inspector,
            pressure,
            phase: phaseFor(pressure, inspector.hiding),
          };
        }

        const unlockedLore = newLore && !state.unlockedLore.includes(newLore)
          ? [...state.unlockedLore, newLore]
          : state.unlockedLore;
        if (unlockedLore !== state.unlockedLore && newLore) {
          const fragment = LORE_BY_ID[newLore];
          if (fragment) {
            toasts = pushToast(toasts, makeToast('lore', 'Nuovo ricordo', fragment.title));
          }
        }

        // Sblocchi narrativi a soglia.
        const totalEssenceEarned = state.totalEssenceEarned + earned;
        let finalLore = unlockedLore;
        for (const fragment of LORE) {
          if (
            fragment.unlockAtTotalEssence !== undefined &&
            totalEssenceEarned >= fragment.unlockAtTotalEssence &&
            !finalLore.includes(fragment.id)
          ) {
            finalLore = [...finalLore, fragment.id];
            toasts = pushToast(toasts, makeToast('lore', 'Nuovo ricordo', fragment.title));
          }
        }

        const draft: GameState = {
          ...state,
          resources: { polvere, essenza, monete, frammenti: state.resources.frammenti },
          relics,
          inspector: nextInspector,
          unlockedLore: finalLore,
          totalRestores,
          totalEssenceEarned,
          lifetimeEssence: state.lifetimeEssence + earned,
        };

        // Un solo predicato valutato per tick: quello dell'obiettivo corrente.
        let completedQuests = state.completedQuests;
        const quest = currentQuest(draft);
        if (quest && quest.check(toProgressView(draft))) {
          completedQuests = [...completedQuests, quest.id];
          toasts = pushToast(toasts, makeToast('success', 'Obiettivo completato', quest.title));
        }

        set({
          resources: draft.resources,
          relics: draft.relics,
          inspector: draft.inspector,
          unlockedLore: draft.unlockedLore,
          toasts,
          totalRestores,
          totalEssenceEarned,
          lifetimeEssence: draft.lifetimeEssence,
          completedQuests,
          lastSeenAt: now,
        });
      },

      // ─── Interazione attiva
      tap: () => {
        const state = get();
        const relic = state.relics[state.activeRelicId];
        const definition = relic ? RELICS_BY_ID[relic.definitionId] : undefined;
        if (!relic || !definition) return;
        if (state.resources.polvere < definition.dustPerTap) return;

        const outcome = applyWork(relic, state.derived.tapPower, state.derived.valueMultiplier);
        let toasts = state.toasts;
        let unlockedLore = state.unlockedLore;

        if (outcome.loreUnlocked && !unlockedLore.includes(outcome.loreUnlocked)) {
          unlockedLore = [...unlockedLore, outcome.loreUnlocked];
          const fragment = LORE_BY_ID[outcome.loreUnlocked];
          if (fragment) {
            toasts = pushToast(toasts, makeToast('lore', 'Nuovo ricordo', fragment.title));
          }
        }
        if (outcome.restores > 0) {
          toasts = pushToast(
            toasts,
            makeToast(
              'success',
              definition.restoredName,
              `+${Math.round(outcome.essence)} essenza`,
              definition.spriteRestored,
            ),
          );
        }

        // I tap manuali generano Pressione esattamente come l'automazione:
        // altrimenti il giocatore attivo sfuggirebbe del tutto all'Ispettore.
        const pressureGain =
          outcome.essence * PRESSURE_PER_ESSENCE * (1 - state.derived.pressureDamping);
        const pressure = clamp(state.inspector.pressure + pressureGain, 0, 1);

        set({
          inspector: {
            ...state.inspector,
            pressure,
            phase: phaseFor(pressure, state.inspector.hiding),
          },
          resources: {
            ...state.resources,
            polvere: state.resources.polvere - definition.dustPerTap,
            essenza: state.resources.essenza + outcome.essence,
            monete: state.resources.monete + outcome.coins,
          },
          relics: { ...state.relics, [relic.definitionId]: outcome.relic },
          totalTaps: state.totalTaps + 1,
          totalRestores: state.totalRestores + outcome.restores,
          totalEssenceEarned: state.totalEssenceEarned + outcome.essence,
          lifetimeEssence: state.lifetimeEssence + outcome.essence,
          unlockedLore,
          toasts,
        });
      },

      selectRelic: (relicId) => {
        if (!get().relics[relicId]) return;
        set({ activeRelicId: relicId });
      },

      // ─── Negozio
      buyUpgrade: (upgradeId, count = 1) => {
        const state = get();
        const definition = UPGRADES_BY_ID[upgradeId];
        if (!definition) return;

        const owned = state.upgrades[upgradeId] ?? 0;
        const limit = definition.maxOwned ?? Number.POSITIVE_INFINITY;
        const wanted = Math.min(count, limit - owned);
        if (wanted <= 0) return;

        let spent = 0;
        let bought = 0;
        const budget = state.resources[definition.costCurrency];
        while (bought < wanted) {
          const next = upgradeCost(definition.baseCost, definition.costGrowth, owned + bought);
          if (spent + next > budget) break;
          spent += next;
          bought += 1;
        }
        if (bought === 0) return;

        const upgrades: UpgradeLevels = { ...state.upgrades, [upgradeId]: owned + bought };
        set({
          upgrades,
          resources: { ...state.resources, [definition.costCurrency]: budget - spent },
          derived: computeDerived(upgrades, state.resources.frammenti),
        });
      },

      // ─── Gacha
      openCrate: (crateId) => {
        const state = get();
        const crate = CRATES_BY_ID[crateId];
        if (!crate) return null;
        if (state.resources[crate.costCurrency] < crate.cost) return null;

        const random = createRng(Date.now() ^ (state.totalTaps * 2654435761));
        const weights = Object.fromEntries(
          (Object.keys(RARITIES) as Rarity[]).map((rarity) => [
            rarity,
            RARITIES[rarity].weight + crate.rarityBias[rarity],
          ]),
        ) as Record<Rarity, number>;

        const rarity = pickWeighted(weights, random);
        const pool = RELICS.filter((relic) => relic.rarity === rarity);
        const picked = pool.length > 0 ? pickOne(pool, random) : RELICS[0];

        const already = state.relics[picked.id];
        const duplicate = already !== undefined;
        const refund = duplicate
          ? DUPLICATE_REFUND_BASE * RARITIES[rarity].valueMultiplier * state.derived.valueMultiplier
          : 0;

        const relics = duplicate
          ? state.relics
          : { ...state.relics, [picked.id]: makeRelicInstance(picked.id) };

        let unlockedLore = state.unlockedLore;
        let loreUnlocked: string | undefined;
        if (!duplicate && picked.loreId && !unlockedLore.includes(picked.loreId)) {
          // Il frammento si sblocca davvero solo al primo restauro: qui si
          // sblocca la *scheda*, non il testo. Mantiene la carota tesa.
          loreUnlocked = undefined;
        }

        const result: CrateResult = {
          relicId: picked.id,
          rarity,
          duplicate,
          refund,
          loreUnlocked,
        };

        set({
          relics,
          unlockedLore,
          resources: {
            ...state.resources,
            [crate.costCurrency]: state.resources[crate.costCurrency] - crate.cost,
            essenza: state.resources.essenza + refund,
          },
          cratesOpened: state.cratesOpened + 1,
          lastCrateResult: result,
          toasts: pushToast(
            state.toasts,
            makeToast(
              duplicate ? 'info' : 'success',
              duplicate ? 'Doppione' : picked.name,
              duplicate
                ? `Convertito in ${Math.round(refund)} essenza`
                : `Rarità ${RARITIES[rarity].label}`,
              picked.spriteBroken,
            ),
          ),
        });
        return result;
      },

      clearCrateResult: () => set({ lastCrateResult: null }),

      // ─── Ispettore
      hideArtifacts: () => {
        const state = get();
        if (!state.inspector.hiding) return;
        set({
          inspector: {
            ...state.inspector,
            hiding: false,
            nextVisitAt: null,
            pressure: 0.1,
            phase: 'calmo',
            visitsSurvived: state.inspector.visitsSurvived + 1,
          },
          toasts: pushToast(
            state.toasts,
            makeToast(
              'success',
              'Visita superata',
              "L'Ispettore non ha trovato nulla. Per stavolta.",
              'ispettore',
            ),
          ),
        });
      },

      // ─── Prestigio
      prestige: () => {
        const state = get();
        const gained = shardsFromEssence(state.lifetimeEssence);
        if (gained <= 0) return;
        const shards = state.resources.frammenti + gained;
        const prestigeCount = state.prestigeCount + 1;
        const fresh = createInitialState(shards, prestigeCount);
        set({
          ...fresh,
          hydrated: true,
          unlockedLore: state.unlockedLore,
          totalTaps: state.totalTaps,
          totalRestores: state.totalRestores,
          cratesOpened: state.cratesOpened,
          loreOpened: state.loreOpened,
          introSeen: true,
          completedQuests: state.completedQuests,
          totalEssenceEarned: state.totalEssenceEarned,
          startedAt: state.startedAt,
          derived: computeDerived({}, shards),
          toasts: pushToast(
            state.toasts,
            makeToast(
              'success',
              'Salto temporale',
              `+${gained} Frammenti di Eternità. Moltiplicatore ×${prestigeMultiplier(shards).toFixed(2)}`,
              'vortice_temporale',
            ),
          ),
        });
      },

      // ─── Progresso offline
      applyOfflineProgress: () => {
        const state = get();
        if (state.hydrated) return;

        const elapsed = Math.min(OFFLINE_CAP_MS, Date.now() - state.lastSeenAt);
        if (elapsed < 30_000 || state.derived.tapsPerSecond <= 0) {
          set({ hydrated: true, lastSeenAt: Date.now() });
          return;
        }

        const seconds = (elapsed / 1_000) * OFFLINE_EFFICIENCY;
        const relic = state.relics[state.activeRelicId];
        const definition = relic ? RELICS_BY_ID[relic.definitionId] : undefined;
        if (!relic || !definition) {
          set({ hydrated: true, lastSeenAt: Date.now() });
          return;
        }

        const wantedTaps = state.derived.tapsPerSecond * seconds;
        const dustAvailable =
          state.resources.polvere + state.derived.dustPerSecond * (elapsed / 1_000);
        const possibleTaps = Math.min(wantedTaps, dustAvailable / definition.dustPerTap);
        const outcome = applyWork(
          relic,
          possibleTaps * state.derived.tapPower,
          state.derived.valueMultiplier,
        );

        set({
          hydrated: true,
          lastSeenAt: Date.now(),
          relics: { ...state.relics, [relic.definitionId]: outcome.relic },
          resources: {
            ...state.resources,
            polvere: Math.min(
              dustCap(state.prestigeCount),
              dustAvailable - possibleTaps * definition.dustPerTap,
            ),
            essenza: state.resources.essenza + outcome.essence,
            monete: state.resources.monete + outcome.coins,
          },
          totalRestores: state.totalRestores + outcome.restores,
          totalEssenceEarned: state.totalEssenceEarned + outcome.essence,
          lifetimeEssence: state.lifetimeEssence + outcome.essence,
          offlineReport: {
            elapsedMs: elapsed,
            essenceGained: outcome.essence,
            relicsRestored: outcome.restores,
            cappedByDust: possibleTaps < wantedTaps - 0.5,
          },
        });
      },

      dismissIntro: () => set({ introSeen: true }),
      markLoreOpened: () => {
        if (get().loreOpened) return;
        set({ loreOpened: true });
      },

      clearOfflineReport: () => set({ offlineReport: null }),
      dismissToast: (toastId) =>
        set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== toastId) })),

      resetGame: () => set({ ...createInitialState(0, 0), hydrated: true }),
    }),
    {
      name: 'relic-loop-save-v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // I toast e i report sono effimeri: non finiscono nel salvataggio.
      partialize: (state) => {
        const { toasts: _t, offlineReport: _o, lastCrateResult: _c, hydrated: _h, ...rest } = state;
        return rest as GameStore;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // `derived` viene dal disco: ricalcolarlo evita salvataggi incoerenti
        // se il bilanciamento cambia fra due versioni.
        state.derived = computeDerived(state.upgrades, state.resources.frammenti);
      },
    },
  ),
);
