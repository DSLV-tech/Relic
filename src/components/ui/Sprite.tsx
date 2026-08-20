import { memo, type CSSProperties } from 'react';

import { spriteUrl } from '../../data/sprites';
import type { SpriteId } from '../../types/game';

export interface SpriteProps {
  readonly id: SpriteId;
  /** Lato in px del riquadro. Gli sprite mantengono il rapporto d'origine. */
  readonly size?: number;
  readonly className?: string;
  readonly alt?: string;
  readonly draggable?: boolean;
  readonly style?: CSSProperties;
  readonly 'aria-hidden'?: boolean;
  /** Riempie il contenitore invece di usare una dimensione fissa in px. */
  readonly fill?: boolean;
}

/**
 * `image-rendering: pixelated` è tutto il segreto: senza, il browser
 * interpola e la pixel art diventa una macchia.
 */
export const Sprite = memo<SpriteProps>(function Sprite({
  id,
  size = 48,
  className = '',
  alt,
  draggable = false,
  style,
  fill = false,
  'aria-hidden': ariaHidden,
}) {
  return (
    <img
      src={spriteUrl(id)}
      width={fill ? undefined : size}
      height={fill ? undefined : size}
      alt={alt ?? id}
      aria-hidden={ariaHidden}
      draggable={draggable}
      loading="lazy"
      className={`select-none object-contain [image-rendering:pixelated] ${
        fill ? 'h-full w-full' : ''
      } ${className}`}
      style={fill ? style : { width: size, height: size, ...style }}
    />
  );
});
