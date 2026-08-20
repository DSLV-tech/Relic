import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
}

/**
 * Unico punto del progetto che deve essere una class component: React non
 * espone ancora `componentDidCatch` agli hook.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[RelicLoop] errore non gestito', error, info.componentStack);
  }

  private readonly reset = (): void => this.setState({ error: null });

  public override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;
    if (!error) return children;
    if (fallback) return fallback(error, this.reset);

    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border border-red-900/60 bg-red-950/30 p-6 text-center">
        <p className="font-semibold text-red-300">La bottega ha avuto un contraccolpo temporale.</p>
        <p className="max-w-md text-sm text-stone-400">{error.message}</p>
        <button
          type="button"
          onClick={this.reset}
          className="rounded border border-amber-600/60 px-4 py-1.5 text-sm text-amber-300 transition hover:bg-amber-600/15"
        >
          Riprova
        </button>
      </div>
    );
  }
}
