import { memo, useEffect } from 'react';

export interface Particle {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly crit: boolean;
  /** 0 → 1: quanto è "carica" la combo, per scalare dimensione e colore. */
  readonly heat: number;
}

interface TapParticlesProps {
  readonly particles: readonly Particle[];
  readonly onDone: (id: number) => void;
}

const FloatingLabel = memo<{ particle: Particle; onDone: (id: number) => void }>(
  function FloatingLabel({ particle, onDone }) {
    useEffect(() => {
      const timer = window.setTimeout(() => onDone(particle.id), 800);
      return () => window.clearTimeout(timer);
    }, [particle.id, onDone]);

    // Il numero cresce con la combo: la ricompensa si vede prima ancora di leggerla.
    const scale = particle.crit ? 2.1 : 1 + particle.heat * 0.7;
    const colour = particle.crit
      ? 'text-amber-200 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]'
      : particle.heat > 0.55
        ? 'text-amber-200'
        : 'text-teal-200';

    return (
      <span
        className={`pointer-events-none absolute animate-float-up font-mono font-black ${colour}`}
        style={{
          left: particle.x,
          top: particle.y,
          fontSize: `${0.95 * scale}rem`,
        }}
      >
        {particle.crit ? `★ ${particle.label}` : particle.label}
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
