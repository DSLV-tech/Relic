import { Sprite } from './Sprite';

export interface LoadingProps {
  readonly label?: string;
}

export const Loading = ({ label = 'Riavvio del terminale…' }: LoadingProps): JSX.Element => (
  <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-stone-400">
    <Sprite id="vortice_temporale" size={64} className="animate-spin [animation-duration:2.4s]" />
    <p className="text-sm tracking-wide">{label}</p>
  </div>
);
