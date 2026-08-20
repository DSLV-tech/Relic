import { memo, useEffect } from 'react';

export interface Particle {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly label: string;
}

interface TapParticlesProps {
  readonly particles: readonly Particle[];
  readonly onDone: (id: number) => void;
}

const FloatingLabel = memo<{ particle: Particle; onDone: (id: number) => void }>(
  function FloatingLabel({ particle, onDone }) {
    useEffect(() => {
      const timer = window.setTimeout(() => onDone(particle.id), 700);
      return () => window.clearTimeout(timer);
    }, [particle.id, onDone]);

    return (
      <span
        className="pointer-events-none absolute animate-float-up font-mono text-sm font-bold text-teal-200 drop-shadow"
        style={{ left: particle.x, top: particle.y }}
      >
        {particle.label}
      </span>
    );
  },
);

export const TapParticles = memo<TapParticlesProps>(function TapParticles({ particles, onDone }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <FloatingLabel key={particle.id} particle={particle} onDone={onDone} />
      ))}
    </div>
  );
});
