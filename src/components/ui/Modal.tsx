import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  /** Le modali "bloccanti" (visita dell'Ispettore) non si chiudono con Esc. */
  readonly dismissible?: boolean;
}

export const Modal = ({
  open,
  title,
  onClose,
  children,
  dismissible = true,
}: ModalProps): JSX.Element | null => {
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={dismissible ? onClose : undefined}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-amber-900/50 bg-stone-950/95 shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-amber-900/40 px-5 py-3">
          <h2 className="font-semibold tracking-wide text-amber-200">{title}</h2>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi"
              className="text-stone-500 transition hover:text-stone-200"
            >
              ✕
            </button>
          )}
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
