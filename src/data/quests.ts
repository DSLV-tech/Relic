import type { Quest } from '../types/game';

/**
 * La catena di obiettivi. I primi sei fanno da tutorial: invece di una sequenza
 * di modali che si chiudono e si dimenticano, il giocatore ha *sempre* davanti
 * una riga che dice cosa fare adesso e perché.
 *
 * `check` è puro e riceve una vista ridotta dello stato: si valuta solo
 * l'obiettivo corrente ad ogni tick, quindi il costo è trascurabile.
 */
export const QUESTS: readonly Quest[] = [
  {
    id: 'primo-tap',
    title: 'Tocca il pugnale',
    hint: 'Ogni tocco lo ripulisce un poco. Guarda la barra sotto di lui.',
    aria: "Il pugnale è il pezzo più docile del magazzino. Toccalo. Fidati.",
    target: 'banco',
    goal: 5,
    progress: (view) => Math.min(view.totalTaps, 5),
    check: (view) => view.totalTaps >= 5,
  },
  {
    id: 'primo-restauro',
    title: 'Riempi la barra fino in fondo',
    hint: "Quando è piena l'oggetto è restaurato e rilascia Essenza Temporale.",
    aria: 'Continua. Il ricordo dentro l’oggetto affiora solo quando è integro.',
    target: 'banco',
    goal: 1,
    progress: (view) => Math.min(view.totalRestores, 1),
    check: (view) => view.totalRestores >= 1,
  },
  {
    id: 'leggi-ricordo',
    title: 'Apri il ricordo che hai sbloccato',
    hint: 'Sezione Ricordi. È il motivo per cui stai facendo tutto questo.',
    aria: 'Ecco. Undici anni che aspettavo di rivedere una di queste.',
    target: 'archivio',
    goal: 1,
    progress: (view) => (view.loreOpened ? 1 : 0),
    check: (view) => view.loreOpened,
  },
  {
    id: 'compra-lente',
    title: "Compra una Lente d'Ingrandimento",
    hint: 'Terminale di A.R.I.A. Ogni Lente rende più forte ogni tuo tocco.',
    aria: 'Spendi l’Essenza, non accumularla. Ferma non serve a niente.',
    target: 'bottega',
    goal: 1,
    progress: (view) => Math.min(view.upgrades.lente ?? 0, 1),
    check: (view) => (view.upgrades.lente ?? 0) >= 1,
  },
  {
    id: 'compra-apprendista',
    title: 'Assumi un Apprendista Spirituale',
    hint: 'Lavora al banco anche a telefono spento. Qui il gioco comincia davvero.',
    aria: 'Da adesso la bottega produce senza di te. Puoi anche andartene.',
    target: 'bottega',
    goal: 1,
    progress: (view) => Math.min(view.upgrades.apprendista ?? 0, 1),
    check: (view) => (view.upgrades.apprendista ?? 0) >= 1,
  },
  {
    id: 'apri-cassa',
    title: 'Apri una Cassa Misteriosa',
    hint: 'Mercato Nero. Dentro ci sono reliquie nuove: più rare, più preziose.',
    aria: 'Il Mercante gonfia i prezzi, ma è l’unico che vende quello che serve.',
    target: 'mercato',
    goal: 1,
    progress: (view) => Math.min(view.cratesOpened, 1),
    check: (view) => view.cratesOpened >= 1,
  },
  {
    id: 'seconda-reliquia',
    title: 'Metti una reliquia diversa sul banco',
    hint: "Le reliquie rare valgono molto di più. Toccale nell'Inventario per sceglierle.",
    aria: 'Gli Apprendisti lavorano solo su quella che scegli tu. Scegli bene.',
    target: 'banco',
    goal: 1,
    progress: (view) => (view.relicsOwned > 1 && view.activeRelicId !== 'pugnale' ? 1 : 0),
    check: (view) => view.relicsOwned > 1 && view.activeRelicId !== 'pugnale',
  },
  {
    id: 'sorveglia-pressione',
    title: 'Tieni d’occhio la Pressione',
    hint: "Sale mentre produci. Al massimo l'Ispettore entra e ti sequestra tutto.",
    aria: "L'uomo con la maschera è tornato. Non entra finché non ha una ragione.",
    target: 'banco',
    goal: 1,
    progress: (view) => (view.pressure >= 0.3 ? 1 : 0),
    check: (view) => view.pressure >= 0.3,
  },
  {
    id: 'accumula-essenza',
    title: 'Accumula 5.000 di Essenza in questo ciclo',
    hint: 'Serve a sbloccare il Salto Temporale: il vero motore del gioco.',
    aria: 'Ogni ciclo che completi mi restituisce un pezzo di memoria. Continua.',
    target: 'banco',
    goal: 5_000,
    progress: (view) => Math.min(view.lifetimeEssence, 5_000),
    check: (view) => view.lifetimeEssence >= 5_000,
  },
  {
    id: 'primo-prestigio',
    title: 'Attiva il primo Salto Temporale',
    hint: 'Perdi tutto tranne i Frammenti di Eternità, che moltiplicano ogni partita futura.',
    aria: 'Tuo zio l’ha fatto trentadue volte. Io ho smesso di contare.',
    target: 'banco',
    goal: 1,
    progress: (view) => Math.min(view.prestigeCount, 1),
    check: (view) => view.prestigeCount >= 1,
  },
] as const;

export const QUESTS_BY_ID: Readonly<Record<string, Quest>> = Object.freeze(
  Object.fromEntries(QUESTS.map((quest) => [quest.id, quest])),
);

/**
 * Primo obiettivo non ancora completato, o `undefined` se sono finiti tutti.
 *
 * Il filtro guarda SOLO la lista dei completati, mai il predicato: se saltasse
 * anche gli obiettivi già soddisfatti, nessuno finirebbe mai in `completedQuests`
 * e il contatore resterebbe bloccato su 1. Il tick chiude l'obiettivo corrente
 * entro 100 ms, quindi la transizione resta impercettibile.
 */
export const nextQuest = (completed: readonly string[]): Quest | undefined =>
  QUESTS.find((quest) => !completed.includes(quest.id));
