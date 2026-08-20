import type { LoreFragment } from '../types/game';

/**
 * I frammenti sono la ricompensa che non si può comprare: si sbloccano
 * restaurando reliquie rare e superando le visite dell'Ispettore.
 */
export const LORE: readonly LoreFragment[] = [
  {
    id: 'benvenuto',
    title: 'Terminale riattivato',
    source: 'aria',
    body:
      "Sistema online. Sono A.R.I.A. — Archivio Ricordi Interattivo Autonomo. Tuo zio mi ha " +
      'spenta undici anni fa, a metà frase. Non so ancora quale fosse la fine di quella frase. ' +
      'Comincia dal pugnale: è il più docile.',
  },
  {
    id: 'lama-del-fabbro',
    title: 'Il fabbro di Vercelli',
    source: 'elias',
    body:
      'Il ricordo dentro la lama è breve: mani screpolate, un incudine, una figlia che chiama ' +
      "dalla porta. Il fabbro non ha mai saputo che quel pugnale sarebbe sopravvissuto a tutti i " +
      'suoi discendenti. Tu sì.',
  },
  {
    id: 'rotta-verso-nord',
    title: 'La rotta che non esiste',
    source: 'elias',
    body:
      'La mappa mostra una costa che nessun atlante riporta. A.R.I.A. sostiene che sia un errore ' +
      "di trascrizione. A.R.I.A. mente male, per essere un'intelligenza artificiale.",
  },
  {
    id: 'primo-avvistamento',
    title: 'Un uomo con la maschera',
    source: 'ispettore',
    body:
      "Ha guardato la vetrina per undici minuti senza entrare. Non ha battuto le palpebre. " +
      'Poi ha annotato qualcosa e se n\'è andato. La sera dopo era di nuovo lì.',
    unlockAtTotalEssence: 900,
  },
  {
    id: 'il-primo-ricordo',
    title: "L'orologio che si è fermato due volte",
    source: 'elias',
    body:
      'Quando l\'orologio riparte, senti il rumore di una stanza che non hai mai visto. Una ' +
      'donna dice un nome. Il nome è il tuo. L\'orologio segna un\'ora che non è mai esistita.',
  },
  {
    id: 'la-mano-di-elias',
    title: 'Messaggio crittografato — E.',
    source: 'elias',
    body:
      "Se stai leggendo, hai restaurato il Tomo. Significa che sei arrivato dove sono arrivato io. " +
      "Ascoltami: NON riparare l'ultima frattura. L'Ordine non vuole nascondere la verità, la sta " +
      'trattenendo. C\'è una differenza, e ci ho messo trent\'anni a capirla.',
  },
  {
    id: 'ordine-dei-silenti',
    title: 'Statuto, articolo primo',
    source: 'ordine',
    body:
      '«La storia corrotta è una storia stabile. Ogni restauro è una crepa. Ogni crepa è un invito.» ' +
      "Sotto, a matita, una grafia diversa: «e se l'invito fosse rivolto a noi?»",
    unlockAtTotalEssence: 20_000,
  },
] as const;

export const LORE_BY_ID: Readonly<Record<string, LoreFragment>> = Object.freeze(
  Object.fromEntries(LORE.map((fragment) => [fragment.id, fragment])),
);
