import { Suspense, lazy, useCallback, useState, type ReactNode } from 'react';

import { useMuteToggle } from '../../hooks/useSound';
import { useIntroSeen, useQuestTarget, useUnlockedLore } from '../../store/selectors';
import type { QuestTarget } from '../../types/game';
import { InventoryGrid } from '../inventory/InventoryGrid';
import { InspectorMeter } from '../pressure/InspectorMeter';
import { LoreLog } from '../narrative/LoreLog';
import { HelpModal } from '../onboarding/HelpModal';
import { IntroScreen } from '../onboarding/IntroScreen';
import { QuestTracker } from '../onboarding/QuestTracker';
import { PrestigePanel } from '../prestige/PrestigePanel';
import { ShopPanel } from '../shop/ShopPanel';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Loading } from '../ui/Loading';
import { Sprite } from '../ui/Sprite';
import { OfflineReportModal } from './OfflineReportModal';
import { ResourceHud } from './ResourceHud';
import { TabBar, type TabId } from './TabBar';
import { ToastStack } from './ToastStack';

// Il gacha carica una modale e la sua animazione: fuori dal bundle iniziale.
const CrateOpener = lazy(() =>
  import('../gacha/CrateOpener').then((module) => ({ default: module.CrateOpener })),
);
const Workbench = lazy(() => import('../workbench/Workbench'));

const Panel = ({
  children,
  className = '',
  highlighted = false,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  /** Bordo pulsante quando l'obiettivo corrente punta a questa sezione. */
  readonly highlighted?: boolean;
}): JSX.Element => (
  <div
    className={[
      'rounded-xl border bg-stone-950/60 p-3 backdrop-blur-sm transition-colors sm:p-4',
      highlighted ? 'border-teal-700/70' : 'border-stone-800/80',
      className,
    ].join(' ')}
  >
    {children}
  </div>
);

/**
 * Una sezione visibile solo quando il suo tab è attivo su mobile, e sempre
 * visibile da `lg` in su. Nessun media query in JS: niente flash al primo render.
 */
const TabPane = ({
  tab,
  active,
  children,
  className = '',
}: {
  readonly tab: TabId;
  readonly active: TabId;
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element => (
  <div className={`${tab === active ? 'flex' : 'hidden'} flex-col gap-4 lg:flex ${className}`}>
    {children}
  </div>
);

export const AppShell = (): JSX.Element => {
  const [tab, setTab] = useState<TabId>('banco');
  const [helpOpen, setHelpOpen] = useState(false);
  const introSeen = useIntroSeen();
  const questTarget = useQuestTarget();
  const unlockedLore = useUnlockedLore();
  const [muted, toggleMute] = useMuteToggle();

  const goToTarget = useCallback((target: QuestTarget) => setTab(target), []);

  if (!introSeen) return <IntroScreen />;

  return (
    <div className="min-h-[100dvh] bg-stone-950 bg-[radial-gradient(ellipse_at_top,rgba(120,80,30,0.16),transparent_65%)] text-stone-200">
      <div
        className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-5"
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
      >
        <header className="flex items-center gap-3">
          <Sprite id="orologio_eternita" size={36} className="sm:h-11 sm:w-11" />
          <div className="mr-auto min-w-0">
            <h1 className="truncate text-base font-bold tracking-wide text-amber-200 sm:text-lg">
              Relic Loop{' '}
              <span className="hidden font-normal text-stone-500 sm:inline">
                — La Bottega del Tempo
              </span>
            </h1>
            <p className="text-[10px] text-stone-600 sm:text-[11px]">prototipo v0.3</p>
          </div>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Attiva l’audio' : 'Disattiva l’audio'}
            aria-pressed={muted}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-stone-700 text-sm text-stone-400 transition hover:border-amber-700/70 hover:text-amber-300"
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="Come si gioca"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-stone-700 text-sm font-semibold text-stone-400 transition hover:border-amber-700/70 hover:text-amber-300"
          >
            ?
          </button>
        </header>

        <ResourceHud onExplain={() => setHelpOpen(true)} />

        <ErrorBoundary>
          <QuestTracker onGoToTarget={goToTarget} currentTab={tab} />
        </ErrorBoundary>

        <main className="grid gap-3 sm:gap-4 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
          {/*
            Ordine DOM = ordine mobile: il banco di lavoro deve stare sopra la
            piega, altrimenti il gesto principale del gioco richiede uno scroll.
            Su desktop le colonne tornano al loro posto con col-start/row-start.
          */}
          <TabPane tab="banco" active={tab} className="lg:col-start-2 lg:row-start-1">
            <Panel className="flex-1" highlighted={questTarget === 'banco'}>
              <ErrorBoundary>
                <Suspense fallback={<Loading label="Preparo il banco…" />}>
                  <Workbench />
                </Suspense>
              </ErrorBoundary>
            </Panel>
            <InspectorMeter />
            <ErrorBoundary>
              <PrestigePanel />
            </ErrorBoundary>
          </TabPane>

          <div className="flex flex-col gap-3 sm:gap-4 lg:col-start-1 lg:row-start-1">
            <TabPane tab="banco" active={tab}>
              <Panel>
                <ErrorBoundary>
                  <InventoryGrid />
                </ErrorBoundary>
              </Panel>
            </TabPane>
            <TabPane tab="mercato" active={tab}>
              <Panel highlighted={questTarget === 'mercato'}>
                <ErrorBoundary>
                  <Suspense fallback={<Loading label="Il Mercante apre la bottega…" />}>
                    <CrateOpener />
                  </Suspense>
                </ErrorBoundary>
              </Panel>
            </TabPane>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 lg:col-start-3 lg:row-start-1">
            <TabPane tab="bottega" active={tab}>
              <Panel
                className="flex max-h-[68vh] min-h-0 flex-col lg:max-h-[58vh]"
                highlighted={questTarget === 'bottega'}
              >
                <ErrorBoundary>
                  <ShopPanel />
                </ErrorBoundary>
              </Panel>
            </TabPane>
            <TabPane tab="archivio" active={tab}>
              <Panel highlighted={questTarget === 'archivio'}>
                <ErrorBoundary>
                  <LoreLog />
                </ErrorBoundary>
              </Panel>
            </TabPane>
          </div>
        </main>
      </div>

      <TabBar
        active={tab}
        onChange={setTab}
        questTarget={questTarget}
        badges={{ archivio: unlockedLore.length > 1 && tab !== 'archivio' }}
      />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <OfflineReportModal />
      <ToastStack />
    </div>
  );
};
