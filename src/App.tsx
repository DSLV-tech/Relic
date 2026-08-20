import { useGameLoop } from './hooks/useGameLoop';
import { useOfflineProgress } from './hooks/useOfflineProgress';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export const App = (): JSX.Element => {
  useOfflineProgress();
  useGameLoop();

  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
};

export default App;
