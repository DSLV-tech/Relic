import type { SpriteGroup, SpriteId } from '../types/game';

/**
 * Manifest sprite → cartella. Generato dagli asset esportati da Affinity
 * (PNG 4x, nearest-neighbour: il pixel deve restare un quadrato).
 */
export const SPRITE_GROUP: Readonly<Record<SpriteId, SpriteGroup>> = {
  antiquario: 'personaggi',
  aria: 'personaggi',
  ispettore: 'personaggi',
  mercante: 'personaggi',
  sacerdote: 'personaggi',
  zio_tobia: 'personaggi',
  pugnale_arrugginito: 'oggetti',
  pugnale_collezione: 'oggetti',
  mappa_sbiadita: 'oggetti',
  mappa_antica: 'oggetti',
  orologio_rotto: 'oggetti',
  orologio_eternita: 'oggetti',
  libro_bruciato: 'oggetti',
  tomo_iniziazione: 'oggetti',
  filtro_tempo: 'ui',
  lingotto_bronzo: 'ui',
  cuore: 'ui',
  fulmine: 'ui',
  moneta: 'ui',
  frammento_eternita: 'ui',
  slot_inventario: 'ui',
  bottone_pausa: 'ui',
  bottone_settings: 'ui',
  ingranaggio_precisione: 'ui',
  contatore: 'ui',
  barra_vuota: 'ui',
  barra_piena: 'ui',
  particella_essenza: 'ui',
  scintilla_oro: 'ui',
  vortice_temporale: 'ui',
  polvere: 'ui',
} as const;

/**
 * Gli sprite sono importati come moduli invece che serviti da /public: così la
 * build single-file può inlinearli in base64 senza duplicare il manifest.
 */
const MODULES = import.meta.glob<string>('../assets/sprites/*/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const URL_BY_ID: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    Object.entries(MODULES).map(([path, url]) => {
      const file = path.slice(path.lastIndexOf('/') + 1).replace('.png', '');
      return [file, url];
    }),
  ),
);

export const spriteUrl = (id: SpriteId): string => URL_BY_ID[id] ?? '';
