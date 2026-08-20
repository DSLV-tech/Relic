import { RESOURCES } from '../../data/relics';
import { Modal } from '../ui/Modal';
import { Sprite } from '../ui/Sprite';

export interface HelpModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

const STEPS: readonly { readonly n: string; readonly title: string; readonly body: string }[] = [
  {
    n: '1',
    title: 'Tocca la reliquia',
    body:
      'Ogni tocco consuma Polvere e riempie la barra. Quando è piena la reliquia è ' +
      'restaurata e ti dà Essenza e Monete.',
  },
  {
    n: '2',
    title: 'Compra potenziamenti',
    body:
      'Nel Terminale di A.R.I.A. spendi Essenza. Le Lenti rendono più forte ogni tocco, ' +
      'gli Apprendisti lavorano al posto tuo anche a telefono chiuso.',
  },
  {
    n: '3',
    title: 'Trova reliquie nuove',
    body:
      'Al Mercato Nero le Casse Misteriose contengono reliquie più rare, che valgono ' +
      'molto di più. I doppioni si convertono in Essenza: nessuna apertura è sprecata.',
  },
  {
    n: '4',
    title: 'Sfuggi all’Ispettore',
    body:
      'Più produci, più sale la Pressione. Quando arriva al massimo hai 12 secondi per ' +
      'nascondere gli artefatti, o perdi gran parte di Essenza e Monete.',
  },
  {
    n: '5',
    title: 'Salta nel tempo',
    body:
      'Il Salto Temporale azzera la bottega ma ti dà Frammenti di Eternità, che ' +
      'moltiplicano per sempre tutte le partite successive. È così che si progredisce davvero.',
  },
];

export const HelpModal = ({ open, onClose }: HelpModalProps): JSX.Element => (
  <Modal open={open} title="Come si gioca" onClose={onClose}>
    <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1">
      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-teal-400">Le risorse</h3>
        <ul className="flex flex-col gap-2">
          {RESOURCES.map((meta) => (
            <li key={meta.id} className="flex items-start gap-2.5">
              <Sprite id={meta.sprite} size={26} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-100">{meta.label}</p>
                <p className="text-[11px] leading-snug text-stone-400">{meta.hint}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-teal-400">Il ciclo</h3>
        <ol className="flex flex-col gap-2.5">
          {STEPS.map((step) => (
            <li key={step.n} className="flex gap-2.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-amber-700/60 font-mono text-[11px] text-amber-300">
                {step.n}
              </span>
              <div>
                <p className="text-xs font-medium text-amber-100">{step.title}</p>
                <p className="text-[11px] leading-snug text-stone-400">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="rounded border border-stone-800 bg-stone-900/60 px-3 py-2 text-[11px] leading-snug text-stone-500">
        Il gioco continua a produrre anche quando lo chiudi, fino a 8 ore. Non c'è niente da
        perdere se non apri l'app per un giorno.
      </p>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-amber-700/60 px-4 py-2 text-sm text-amber-200 transition hover:bg-amber-700/20"
      >
        Ho capito
      </button>
    </div>
  </Modal>
);
