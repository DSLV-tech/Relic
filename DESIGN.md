# Relic Loop — La Bottega del Tempo
## Documento di design — mobile-first, React 18 + Vite

---

## 1. Il concept in una riga

Erediti la bottega d'antiquariato di uno zio scomparso e scopri che restaurare
oggetti non è un mestiere: è il modo in cui si riparano le fratture della linea
temporale. Un'organizzazione preferirebbe che la storia restasse rotta.

Il gancio non è "i numeri salgono". È **"cosa ricorda questo oggetto?"** — ogni
reliquia restaurata rilascia un frammento di memoria di chi l'ha posseduta, e i
frammenti compongono una storia che il giocatore mette insieme da solo.

---

## 2. Trama

**Atto I — L'eredità.** Ricevi le chiavi di una bottega polverosa a Vercelli. Fra
gli scatoloni trovi un terminale steampunk mezzo bruciato. Lo ripari e si accende:
è A.R.I.A., un'intelligenza spenta undici anni fa a metà frase. Il primo oggetto che
pulisci — un orologio da taschino rotto — emette una luce dorata e ti trasmette il
ricordo del suo proprietario nel 1873.

**Atto II — La regola.** A.R.I.A. ti spiega la meccanica: gli oggetti trattengono
memoria, la memoria trattiene la storia, e la storia ha delle crepe. Più restauri,
più *Essenza Temporale* accumuli, più le crepe si richiudono. Ma qualcuno comincia a
guardare la vetrina. Un uomo con una maschera bianca, che non entra mai.

**Atto III — L'Ordine.** L'Ispettore è un agente dell'Ordine dei Silenti. Il loro
statuto, articolo primo: *«La storia corrotta è una storia stabile. Ogni restauro è
una crepa. Ogni crepa è un invito.»* Comincia a visitare la bottega. Devi nascondere
gli artefatti quando arriva, o ti sequestra il lavoro di ore.

**Atto IV — Il messaggio.** Restaurando un Tomo bruciato di rarità leggendaria trovi
un messaggio crittografato di tuo zio Elias: *«NON riparare l'ultima frattura.
L'Ordine non vuole nascondere la verità, la sta trattenendo. C'è una differenza, e ci
ho messo trent'anni a capirla.»* La domanda che regge tutto il resto del gioco: da
che parte stava Elias, e da che parte stai tu.

**Atto V — Il loop.** Quando la Pressione diventa insostenibile l'unica uscita è la
macchina del tempo: torni al primo giorno, perdi tutto tranne i *Frammenti di
Eternità* e i ricordi già letti. Ogni ciclo riveli un pezzo in più di cosa sia
successo a Elias. Il prestigio non è una meccanica appiccicata sopra la storia: è
la storia.

---

## 3. Personaggi

| Personaggio | Ruolo meccanico | Ruolo narrativo |
|---|---|---|
| **L'Antiquario** (il giocatore) | Il tap manuale. L'unico che può incanalare l'Essenza | Erede per caso, non per vocazione |
| **A.R.I.A.** | Il negozio: potenziamenti e automazione | Tutorial e voce fissa. Sa più di quanto dice, e mente male |
| **Zio Elias** | Nessuno — appare solo nei frammenti | Il mistero centrale. Parla solo tramite oggetti leggendari |
| **L'Ispettore** | La Pressione e le visite: il timer di sicurezza del gioco | L'antagonista che non alza mai la voce. Più inquietante perché procedurale |
| **Il Mercante del Mercato Nero** | Il gacha: vende le Casse Misteriose | Comic relief mercenario. Ricompra i doppioni senza fare domande |
| **Il Sacerdote dei Silenti** | Un potenziamento: le offerte rallentano la Pressione | La possibilità di corrompere l'Ordine — e cosa significa accettarla |

**Zio Tobia** (lo sprite del vecchio barbuto) è il volto di Elias nei ricordi: lo
vedi giovane nei frammenti antichi, anziano negli ultimi. È un dettaglio da
implementare quando ci saranno più sprite.

---

## 4. Le quattro meccaniche e come si agganciano

### 4.1 Il tap — fase attiva
Ogni tocco consuma **Polvere** e aggiunge lavoro alla reliquia sul banco. La barra si
riempie, l'oggetto si restaura, rilascia **Essenza** e **Monete**.

La Polvere è la scelta di design più importante del prototipo. Senza di lei il gioco
premia chi martella lo schermo più a lungo — che è un test di resistenza del pollice,
non un gioco. Con la Polvere ogni sessione attiva ha una durata naturale di 40-90
secondi, poi conviene mettere via il telefono e lasciare lavorare gli Apprendisti.
**Il freno è una feature, non un ostacolo.**

### 4.2 L'automazione — fase idle
Gli **Apprendisti Spirituali** producono tap al secondo sulla reliquia attiva,
consumando Polvere come farebbe il giocatore. Alla riapertura il gioco calcola il
tempo trascorso (massimo 8 ore, efficienza 55%) e mostra il resoconto *"Mentre eri
via"*.

L'efficienza ridotta è la carota per rientrare; il cap a 8 ore è il guinzaglio che
impedisce al gioco di chiedere di essere aperto ogni due ore. Sono due leve opposte
tenute in equilibrio deliberato.

### 4.3 Il gacha — collezionismo
Le **Casse Misteriose** estraggono reliquie con pesi per rarità (62/26/9/3). I
doppioni si convertono in Essenza: non esiste il pull sprecato, ed è questo che rende
sostenibile aprire la ventesima cassa senza frustrazione.

Le reliquie rare sbloccano le *schede* dell'Archivio dei Ricordi, ma **il testo si
legge solo restaurandole davvero**. Il gacha dà l'accesso, il lavoro dà il contenuto.

### 4.4 La Pressione e il prestigio — il loop infinito
La Pressione sale con l'Essenza prodotta (tap manuali inclusi) e scende lentamente da
sola. Al 100% l'Ispettore entra: **12 secondi per nascondere gli artefatti**,
altrimenti perdi il 40% dell'Essenza e il 60% delle Monete.

Il **Salto Temporale** azzera bottega, potenziamenti e reliquie in cambio di
`⌊(essenza / 25.000)^0,55⌋` **Frammenti di Eternità**, ognuno +14% permanente su tutto.

Qui c'è la tensione che tiene in piedi la sessione lunga: più produci, più ti avvicini
sia al prestigio (buono) sia alla perquisizione (pessimo). La decisione di *quando*
saltare è la vera scelta strategica del gioco.

---

## 5. Design mobile

Il gioco è pensato per essere giocato **in verticale, con una mano, in sessioni da un
minuto**. Da qui discende tutto il resto.

**Layout.** Su schermi stretti l'interfaccia è a tab, con la barra in fondo — l'unica
zona raggiungibile col pollice su un telefono da 6". Il banco di lavoro è il primo
elemento sotto la HUD: **il gesto principale del gioco non deve mai richiedere uno
scroll**. La HUD delle risorse è sticky in alto e si compatta (spariscono le etichette,
resta l'icona e il numero). Da `lg` in su le tre colonne tornano affiancate e la tab bar
sparisce: stessa base di codice, nessun media query in JavaScript e quindi nessun
flash al primo render.

**Input.** Il tap usa `pointerdown` e non `click`: su mobile il click arriva ~80 ms
dopo il rilascio del dito, e in un clicker quel ritardo si sente come input lag. Il
pulsante ha `touch-action: manipulation` (niente zoom da doppio tap),
`-webkit-tap-highlight-color: transparent` (niente flash blu) e
`overscroll-behavior-y: none` sul body (niente pull-to-refresh mentre si martella).

**Aptica.** Vibrazione corta ad ogni tap, pattern doppio sul restauro, pattern lungo
all'arrivo dell'Ispettore — l'unico evento che può cogliere il giocatore con lo
schermo spento. Su iOS `navigator.vibrate` non esiste e l'hook degrada in silenzio.

**Safe area.** `viewport-fit=cover` più `env(safe-area-inset-bottom)` su tab bar e
contenuto: niente pulsanti sotto la barra home dell'iPhone.

**Performance.** Il tick gira a 10 Hz. Con un Context unico ogni tick
ri-renderizzerebbe l'intero albero — su un telefono di fascia media significa frame
persi proprio durante il tap. Con Zustand ogni componente si sottoscrive al solo
valore che legge: il contatore della Polvere si aggiorna dieci volte al secondo
mentre l'inventario resta immobile.

---

## 5-bis. Insegnare il gioco senza un manuale

Il test più duro l'ha fatto la prima persona che ci ha messo le mani: *«non capisco come
si giochi»*. Aveva ragione — c'era un pulsante che non dichiarava di essere un pulsante e
quattro contatori senza nome.

La correzione sta su quattro livelli, applicati in quest'ordine perché ognuno è più
invadente del precedente e va usato solo se il precedente non basta:

1. **L'affordance.** Il banco dice `TOCCA PER RESTAURARE`. La scritta sparisce al primo
   tocco e ricompare se il giocatore si ferma: informa chi non sa, non disturba chi sa.
2. **L'obiettivo corrente.** Una riga fissa sotto la HUD, con la faccia di A.R.I.A., che
   dice cosa fare e perché conviene. Toccarla apre la sezione giusta; quella sezione
   pulsa nella tab bar finché non ci vai. È la differenza fra un tutorial e una guida:
   il tutorial finisce, la guida resta.
3. **L'introduzione.** Tre schermate, saltabili, che stabiliscono chi sei e cosa c'è in
   gioco. Servono a dare un motivo al primo tocco, non a spiegare i comandi.
4. **La guida completa.** Dal `?` in alto, e anche toccando una risorsa: chi si chiede
   "cos'è questo numero" lo tocca, ed è lì che deve trovare la risposta.

Il principio: **nessun momento del gioco deve lasciare il giocatore senza una prossima
azione ovvia.** In un incremental questo vale doppio, perché non c'è una storia lineare
che ti spinge avanti — solo una serie di scelte che devono sembrare tutte comprensibili.

## 5-ter. Il game feel dei primi sessanta secondi

Secondo test sul campo: *«continuo a fare click sul pugnale ma non accade quasi nulla»*.
Due problemi distinti, mascherati da uno.

**L'economia era troppo lenta.** Servivano 12 tocchi per il primo restauro e circa 48 per
potersi permettere il primo potenziamento. In un clicker la prima ricompensa vera deve
arrivare entro il primo mezzo minuto, altrimenti il giocatore non arriva mai a scoprire
che esiste un ciclo. Ora: primo restauro al 4° tocco, prima Lente all'11°.

**Il feedback era muto.** Un "+1" grigio di 12 px e una scala del 3.5%. Le tre leve che
ho aggiunto, in ordine di impatto:

- **La combo.** È la singola meccanica che trasforma il tapping da compito a gioco: dà
  un obiettivo momento per momento («non spezzare la catena») dentro un'attività che
  altrimenti è solo ripetizione. Sale a ×2.2, si azzera col silenzio, e il moltiplicatore
  è mostrato grande sopra la reliquia — dove l'occhio è già.
- **I critici.** Varianza. Un 9% di tocchi che valgono cinque volte tanto rende ogni
  singolo tocco un piccolo lancio di dado invece di un incremento noto.
- **L'audio.** Sintetizzato, quindi il tono del tap può salire con la combo. Sentire la
  scala che sale mentre il numero cresce è metà della soddisfazione, e non costa un solo
  byte di asset.

E una sottrazione che conta quanto le aggiunte: **ho tolto le notifiche di restauro.**
Coprivano la reliquia — tre "+6 essenza" identiche impilate sopra la cosa che il
giocatore stava guardando. La regola che ne esce: *un toast serve per ciò che accade
fuori dal fuoco visivo.* Quello che succede sotto il dito si mostra dove sta il dito.

## 6. Ritenzione: cosa c'è e cosa ho lasciato fuori di proposito

La richiesta era «un gioco che non ti faccia staccare dal telefonino». Vale la pena
essere espliciti su cosa significa, perché ci sono due modi molto diversi di
ottenerlo.

**Quello che tiene incollati e che ho messo dentro** — sono tutti meccanismi che
danno al giocatore qualcosa in cambio del suo tempo:

- **Ricompensa immediata e leggibile.** Numero che sale, particella, vibrazione, barra
  che avanza: ogni tocco produce un effetto visibile entro 16 ms.
- **Sblocchi a scaglioni.** Il negozio rivela un potenziamento nuovo a soglie
  crescenti, quindi c'è sempre un obiettivo prossimo a vista.
- **Curiosità narrativa.** L'Archivio mostra le schede bloccate come `████████████`:
  sai che esistono sette ricordi e ne hai letti tre. È la spinta più forte del gioco
  e non costa niente al giocatore.
- **Progresso offline.** Chiudere l'app non azzera nulla — anzi produce il momento
  "Mentre eri via" al rientro.
- **Varianza controllata del gacha.** I doppioni valgono comunque, quindi la sorpresa
  resta piacevole invece di diventare punitiva.
- **Decisione strategica ricorrente.** Quando saltare? È una scelta vera, ripetuta,
  con conseguenze — il tipo di coinvolgimento che regge nel tempo.

**Quello che ho lasciato fuori, e perché.** Esiste un altro repertorio di tecniche che
alza la ritenzione lavorando contro l'utente invece che per lui, e non l'ho messo:

- **Nessun timer punitivo né streak da perdere.** Niente "torna entro 4 ore o perdi il
  bonus": sarebbe ansia progettata a tavolino, e trasforma un gioco in un obbligo.
- **Nessuna notifica push che richiama.** Il cap offline a 8 ore rende inutile
  riaprire l'app ogni due ore, quindi non serve nemmeno il pretesto per notificarlo.
- **Nessuna valuta premium a pagamento, nessun paywall sul progresso.** I Frammenti si
  guadagnano solo giocando.
- **Nessun timer di attesa accorciabile a pagamento**, nessuna cassa che si apre in
  4 ore reali.

La differenza pratica: un gioco della prima categoria si smette di giocare con la
sensazione di aver passato del tempo bene, e ci si torna volentieri. Uno della seconda
si smette con la sensazione di essersi fatti fregare — e funziona benissimo sulle
metriche a 30 giorni, molto meno a 12 mesi. Se in futuro vuoi monetizzare, la strada
coerente con questo design è cosmetica (skin delle reliquie, temi della bottega) o
contenuto (nuovi atti della storia), non scorciatoie sul progresso.

Se invece vuoi che aggiunga comunque qualcuna delle leve più aggressive, dimmelo e le
implemento — è una tua decisione di prodotto, volevo solo che fosse una decisione
esplicita e non un default che ti ritrovi addosso.

---

## 7. Roadmap oltre il prototipo

1. **Fondale della bottega.** Lo sfondo scuro attuale è un segnaposto. La scena
   d'ambiente (quella che hai in mente: buia, stracolma, calda) cambia radicalmente la
   percezione del gioco e vale più di dieci meccaniche nuove.
2. **Animazioni di restauro.** 2-3 frame per reliquia al posto del crossfade.
3. **Audio.** In un clicker il suono del tap è metà del game feel.
4. **Più reliquie e più atti.** La struttura dati regge già N reliquie: servono solo
   sprite e testi.
5. **Test.** `applyWork`, `shardsFromEssence` e `bulkUpgradeCost` sono funzioni pure,
   pronte per Vitest senza refactoring.
6. **Salvataggio cloud.** Lo store è già serializzabile; basta sostituire lo storage
   di `persist`.
