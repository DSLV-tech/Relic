# Relic Loop — La Bottega del Tempo

Prototipo di idle/clicker narrativo **mobile-first**. React 18 + TypeScript + Vite +
Tailwind + Zustand. Tutti gli sprite sono pixel art vettoriale creata in Affinity
Designer ed esportata a 4x.

> Trama, personaggi, meccaniche e le scelte di design mobile sono in **[DESIGN.md](./DESIGN.md)**.
> Questo file copre solo come far girare il progetto e com'è fatto il codice.

```bash
pnpm install      # o npm install
pnpm dev          # http://localhost:5173
pnpm typecheck    # tsc --noEmit, zero errori
pnpm build        # typecheck + build di produzione
pnpm build:single # un solo .html autonomo in dist-single/
```

Se vuoi solo provarlo: apri `relic-loop-giocabile.html` con un doppio clic.

---

## Il loop

Quattro fasi che si alimentano a vicenda. È la struttura standard degli incremental,
ma qui ogni fase è agganciata alla narrativa invece di essere solo un numero che sale.

**1 — Tap (fase attiva).** Ogni clic sulla reliquia consuma *Polvere* e aggiunge
lavoro. Quando la barra si riempie l'oggetto è restaurato e rilascia *Essenza* e
*Monete*. La Polvere è il freno: si rigenera a ritmo fisso, quindi il click frenetico
si autolimita e la sessione ha un respiro naturale invece di premiare il macro.

**2 — Automazione (fase idle).** Gli *Apprendisti Spirituali* generano tap al secondo
sulla reliquia attiva, consumando Polvere come il giocatore. Alla riapertura il gioco
calcola il tempo trascorso (cap 8 ore, efficienza 55%) e mostra il resoconto: è il
momento di ricompensa che riporta indietro le persone.

**3 — Gacha.** Le *Casse Misteriose* del Mercante estraggono reliquie con pesi per
rarità. I doppioni si convertono in Essenza — non esiste il pull "sprecato", che è
ciò che rende sostenibile aprire la ventesima cassa. Le reliquie rare sbloccano le
schede dell'*Archivio dei Ricordi*, ma il testo si legge solo restaurandole davvero.

**4 — Prestigio.** La *Pressione* dell'Ispettore sale con l'Essenza prodotta. Al 100%
lui entra: hai 12 secondi per nascondere gli artefatti, altrimenti perdi il 40%
dell'Essenza e il 60% delle Monete. Il *Salto Temporale* azzera bottega, potenziamenti
e reliquie in cambio di *Frammenti di Eternità*, che moltiplicano permanentemente ogni
partita successiva. È l'uscita di sicurezza e insieme il loop infinito.

## Le formule

Tutto il bilanciamento vive in `src/data/balance.ts`. Cambia lì e ricarica.

| Cosa | Formula | Dove |
|---|---|---|
| Costo potenziamento | `base × growth^posseduti` | `lib/math.ts` |
| Costo di N livelli | somma di serie geometrica, non un ciclo | `bulkUpgradeCost` |
| Lavoro per restauro | `baseWork × 1.12^restauri` | `applyWork` |
| Frammenti da prestigio | `⌊(essenzaCiclo / 25.000)^0.55⌋` | `shardsFromEssence` |
| Moltiplicatore prestigio | `1 + frammenti × 0,14` | `prestigeMultiplier` |
| Pressione | `+0,000055 per essenza`, `−0,00035/s` | `gameStore.tick` |

Le tre leve da toccare per primo se il ritmo non convince: `costGrowth` dei
potenziamenti (quanto in fretta si tocca il muro), `PRESTIGE_THRESHOLD` (durata di un
ciclo), `PRESSURE_PER_ESSENCE` (quanto spesso appare l'Ispettore).

## Perché queste scelte tecniche

**Zustand invece di Context.** Il tick gira a 10 Hz. Con un Context unico ogni tick
ri-renderizza tutto l'albero sotto il provider; con Zustand ogni componente si
sottoscrive al solo pezzo di stato che legge (`store/selectors.ts`), quindi il
contatore della Polvere si aggiorna 10 volte al secondo mentre l'inventario resta
fermo. `useShallow` evita di ri-renderizzare quando un selettore ricostruisce un
oggetto con gli stessi valori.

**`derived` calcolato, non ricalcolato.** Le statistiche (potenza tap, tap/s,
moltiplicatori) dipendono solo da potenziamenti e Frammenti, quindi si ricalcolano
all'acquisto e al prestigio — non ad ogni tick. `computeDerived` è una funzione pura,
riusata sia dal tick sia dal progresso offline sia (in futuro) dai test.

**`requestAnimationFrame` con passo fisso.** `setInterval` viene strozzato in modo
imprevedibile dal browser in background. rAF si ferma del tutto quando la scheda non è
visibile — che è esattamente ciò che vogliamo: il tempo perso viene poi recuperato in
blocco dal progresso offline, con la sua efficienza ridotta, invece di essere simulato
male. L'accumulatore a passo fisso (`TICK_MS`) rende la simulazione indipendente dagli
FPS.

**`memo` / `useCallback` dove serve.** Non a tappeto: solo sui componenti che stanno
dentro liste o che ricevono callback da un genitore che ri-renderizza spesso
(`UpgradeCard`, `Sprite`, `ToastCard`, le particelle). Memoizzare un componente che
ri-renderizza comunque ad ogni tick costa più di quanto risparmi.

**Error Boundary per pannello.** Ogni sezione è isolata: se il gacha esplode, il banco
di lavoro continua a funzionare e non perdi la sessione.

**`image-rendering: pixelated` ovunque.** Senza, il browser interpola i PNG 4x e la
pixel art diventa una macchia.

## Pubblicare su GitHub Pages

Il deploy è automatico: ogni push su `main` ricostruisce e pubblica.

**Una tantum, su GitHub:** *Settings → Pages → Build and deployment → Source:*
**GitHub Actions** (non "Deploy from a branch"). Basta questo — il workflow è già in
`.github/workflows/deploy.yml`.

**Perché funziona senza configurare il percorso.** `vite.config.ts` usa `base: './'`,
quindi tutti gli asset finiscono con URL relativi: l'app gira identica su
`utente.github.io/Relic/`, su un dominio custom o aperta da disco. Non c'è nessun nome
di repository cablato nel codice — se rinomini il repo non si rompe niente.

Dopo il primo deploy il gioco è a `https://<utente>.github.io/Relic/`, e la versione a
file singolo resta a `https://<utente>.github.io/Relic/giocabile.html`.

**Se la pagina esce bianca**, apri la console del browser: quasi sempre è `base`
sbagliata, e si vede da richieste 404 su `/assets/...` invece che su `/Relic/assets/...`.

## Onboarding

Il prototipo v0.1 non spiegava niente: un pulsante che non diceva di essere premuto e
quattro numeri senza contesto. La v0.2 risolve il problema su quattro livelli, dal più
leggero al più esplicito.

1. **Invito sul banco.** `TOCCA PER RESTAURARE` compare sul pulsante e sparisce al primo
   tocco; se il giocatore resta fermo più di 2,6 secondi torna, insieme a una pulsazione
   dorata del bordo.
2. **Catena di obiettivi** (`src/data/quests.ts`). Una riga sempre presente sotto la HUD
   dice cosa fare adesso e perché, con la voce di A.R.I.A. e una barra di progresso.
   Toccarla porta alla sezione giusta, che nel frattempo pulsa nella tab bar. I primi sei
   obiettivi fanno da tutorial; gli altri restano utili per ore. Non è una sequenza di
   modali che si chiude e si dimentica.
3. **Introduzione narrativa** in tre battute alla prima apertura, saltabile.
4. **Guida "Come si gioca"** dal `?` nell'header, e anche toccando una qualsiasi
   risorsa nella HUD — perché "cos'è questo numero?" è la domanda più frequente.

I predicati delle quest sono funzioni pure su una vista piatta dello stato
(`GameProgressView`) e ne viene valutato **uno solo per tick**, quello corrente.

## Game feel

Un clicker sta in piedi o cade sui primi sessanta secondi. La v0.1 ne chiedeva 48 di
tocchi prima della prima ricompensa reale e rispondeva con un "+1" grigio da 12 px.

**Economia.** Il pugnale richiede 8 punti di lavoro invece di 12 e ne rende 6 di essenza
invece di 4; la prima Lente costa 10 invece di 15. Risultato misurato a ritmo realistico
(~4 tocchi al secondo): **primo restauro al 4° tocco, primo potenziamento comprabile
all'11°** — erano rispettivamente 12 e ~48.

**Combo.** Tocchi entro 700 ms si concatenano fino a ×2.2 (`COMBO_*` in `balance.ts`).
Non costa Polvere extra: è una ricompensa per il ritmo, non una tassa sulla velocità. Il
moltiplicatore è grande e cambia colore da oro a rosso mentre sale.

**Critici.** 9% di probabilità, ×5 danno, numero doppio con stella e bagliore.

**Feedback per tocco.** Tre canali sempre insieme: numero volante che cresce con la
combo, blip WebAudio il cui tono sale di un'ottava lungo la combo, vibrazione.
Al restauro si aggiungono scossa dello schermo, quattordici particelle sprite a ventaglio
e un arpeggio pentatonico.

**Audio senza file.** `src/lib/audio.ts` sintetizza tutto con WebAudio: zero asset da
scaricare, zero licenze, e il suono può reagire allo stato (cosa impossibile con un
campione fisso). Il contesto si sblocca al primo `pointerdown` — i browser rifiutano di
suonare prima. Interruttore muto nell'header, preferenza fuori dal salvataggio di gioco.

**Niente notifiche per i restauri.** Restaurare produce un evento sotto il pollice del
giocatore: annunciarlo con un toast significa coprire proprio la cosa che sta guardando.
Il guadagno appare grande al centro dell'oggetto. I toast restano per ciò che accade
fuori dal fuoco visivo — ricordi, obiettivi, Ispettore — e due uguali di fila si fondono.

## Mobile

Il layout è a tab con barra in fondo sotto `lg`, tre colonne sopra — stessa base di
codice, nessun media query in JavaScript (quindi nessun flash al primo render). Il
banco di lavoro è sempre sopra la piega: il gesto principale non deve mai richiedere
uno scroll.

Il tap usa `pointerdown` invece di `click` (su mobile il click arriva ~80 ms dopo il
rilascio e in un clicker si sente come lag), con `touch-action: manipulation`,
`-webkit-tap-highlight-color: transparent` e `overscroll-behavior-y: none`. Feedback
aptico via `navigator.vibrate`, che su iOS degrada in un no-op silenzioso.

## Struttura

```
src/
  types/game.ts        modello di dominio, zero `any`
  data/                bilanciamento, reliquie, potenziamenti, lore, manifest sprite
  lib/                 formule pure: math, format, rng seedabile
  store/               gameStore (zustand + persist) e selettori granulari
  hooks/               game loop, progresso offline, numeri animati
  components/
    layout/            shell, HUD risorse, toast, resoconto offline
    workbench/         banco di lavoro, barra, particelle
    shop/              terminale di A.R.I.A.
    inventory/         griglia reliquie
    gacha/             casse misteriose (lazy)
    prestige/          salto temporale
    pressure/          barra e visita dell'Ispettore
    narrative/         archivio dei ricordi
    ui/                Sprite, Modal, Loading, ErrorBoundary
  assets/sprites/      PNG 4x esportati da Affinity
```

## Cosa manca (in ordine di impatto)

1. **Fondale della bottega** — lo sfondo scuro attuale è un segnaposto; la scena
   d'ambiente cambia radicalmente la percezione del gioco.
2. **Animazioni di restauro** — 2-3 frame per reliquia, invece del crossfade attuale.
3. **Audio** — il feedback del tap è metà del game feel di un clicker.
4. **Test** — `applyWork`, `shardsFromEssence` e `bulkUpgradeCost` sono funzioni pure
   già pronte per Vitest.
5. **Bilanciamento oltre il ciclo 3** — le curve attuali sono verificate fino a lì.
