import { memo, useEffect, useState } from 'react';

import type { SpriteId } from '../../types/game';
import { Sprite } from '../ui/Sprite';

export interface Burst {
  readonly id: number;
  readonly sprite: SpriteId;
  readonly count: number;
}

interface Shard {
  readonly key: string;
  readonly sprite: SpriteId;
  readonly dx: number;
  readonly dy: number;
  readonly rotation: number;
  readonly delay: number;
  readonly size: number;
}

/** Ventaglio verso l'alto: le monete "saltano fuori" invece di esplodere a caso. */
const makeShards = (burst: Burst): readonly Shard[] =>
  Array.from({ length: burst.count }, (_, index) => {
    const spread = (index / Math.max(1, burst.count - 1)) * 2 - 1;
    const angle = spread * 1.05 - Math.PI / 2;
    const distance = 68 + Math.random() * 62;
    return {
      key: `${burst.id}-${index}`,
      sprite: index % 3 === 0 ? 'moneta' : burst.sprite,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      rotation: (Math.random() * 2 - 1) * 180,
      delay: index * 18,
      size: 18 + Math.round(Math.random() * 12),
    };
  });

interface BurstParticlesProps {
  readonly bursts: readonly Burst[];
  readonly onDone: (id: number) => void;
}

const BurstGroup = memo<{ burst: Burst; onDone: (id: number) => void }>(function BurstGroup({
  burst,
  onDone,
}) {
  const [shards] = useState(() => makeShards(burst));

  useEffect(() => {
    const timer = window.setTimeout(() => onDone(burst.id), 1_000);
    return () => window.clearTimeout(timer);
  }, [burst.id, onDone]);

  return (
    <>
      {shards.map((shard) => (
        <span
          key={shard.key}
          className="animate-burst absolute left-1/2 top-1/2"
          style={
            {
              '--dx': `${shard.dx}px`,
              '--dy': `${shard.dy}px`,
              '--rot': `${shard.rotation}deg`,
              animationDelay: `${shard.delay}ms`,
            } as React.CSSProperties
          }
        >
          <Sprite id={shard.sprite} size={shard.size} />
        </span>
      ))}
    </>
  );
});

export const BurstParticles = memo<BurstParticlesProps>(function BurstParticles({
  bursts,
  onDone,
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {bursts.map((burst) => (
        <BurstGroup key={burst.id} burst={burst} onDone={onDone} />
      ))}
    </div>
  );
});
