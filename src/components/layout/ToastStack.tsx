import { useEffect } from 'react';

import { useGameStore } from '../../store/gameStore';
import { useToasts } from '../../store/selectors';
import type { Toast, ToastKind } from '../../types/game';
import { Sprite } from '../ui/Sprite';

const TONE: Readonly<Record<ToastKind, string>> = {
  info: 'border-stone-700 bg-stone-900/95',
  success: 'border-amber-700/70 bg-amber-950/85',
  warning: 'border-red-700/70 bg-red-950/85',
  lore: 'border-violet-700/70 bg-violet-950/85',
};

const ToastCard = ({ toast }: { readonly toast: Toast }): JSX.Element => {
  const dismiss = useGameStore((state) => state.dismissToast);

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), 3_400);
    return () => window.clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <button
      type="button"
      onClick={() => dismiss(toast.id)}
      className={`ml-auto flex w-auto max-w-full animate-slide-in items-center gap-2 rounded-lg border px-2.5 py-1 text-left shadow-xl backdrop-blur lg:ml-0 lg:w-full lg:max-w-xs lg:px-3 lg:py-2 ${TONE[toast.kind]}`}
    >
      {toast.sprite && <Sprite id={toast.sprite} size={20} className="shrink-0 lg:h-8 lg:w-8" />}
      {/* Su mobile titolo e dettaglio stanno sulla stessa riga: una notifica
          alta due righe copriva metà del banco di lavoro. */}
      <div className="flex min-w-0 items-baseline gap-1.5 lg:block">
        <p className="truncate text-[11px] font-medium text-amber-100 lg:text-xs">{toast.title}</p>
        {toast.body && (
          <p className="truncate text-[10px] text-stone-400 lg:text-[11px]">
            <span className="lg:hidden">· </span>
            {toast.body}
          </p>
        )}
      </div>
    </button>
  );
};

/**
 * Su mobile le notifiche scendono da sotto le barre superiori: prima stavano
 * in basso a destra e coprivano esattamente il pulsante di tap e la scritta
 * che invita a premerlo. Su schermo stretto ne resta visibile una sola.
 */
export const ToastStack = (): JSX.Element => {
  const toasts = useToasts();
  return (
    <div className="pointer-events-none absolute inset-x-3 top-full z-40 flex flex-col gap-1 pt-1 [&>*:nth-child(n+2)]:hidden sm:px-0 lg:fixed lg:inset-x-auto lg:bottom-4 lg:right-4 lg:top-auto lg:flex-col-reverse lg:gap-2 lg:pt-0 lg:[&>*:nth-child(n+2)]:block">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastCard toast={toast} />
        </div>
      ))}
    </div>
  );
};
