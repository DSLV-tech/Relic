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
      className={`flex w-full max-w-xs animate-slide-in items-center gap-2.5 rounded-lg border px-3 py-2 text-left shadow-xl backdrop-blur ${TONE[toast.kind]}`}
    >
      {toast.sprite && <Sprite id={toast.sprite} size={32} />}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-amber-100">{toast.title}</p>
        {toast.body && <p className="truncate text-[11px] text-stone-400">{toast.body}</p>}
      </div>
    </button>
  );
};

export const ToastStack = (): JSX.Element => {
  const toasts = useToasts();
  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-[4.75rem] z-40 flex flex-col-reverse items-end gap-2 lg:inset-x-auto lg:bottom-4 lg:right-4">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastCard toast={toast} />
        </div>
      ))}
    </div>
  );
};
