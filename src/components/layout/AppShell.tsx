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
import { PrestigeCallout } from '../prestige/PrestigeCallout';
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
  <div
    className={`${tab === active ? 'flex' : 'hidden'} min-h-0 flex-col gap-3 sm:gap-4 lg:flex ${className}`}
  >
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
    /**
     * Su mobile l'app è alta esattamente quanto il viewport e non scrolla: le
     * sezioni che hanno bisogno di scorrere lo fanno internamente. È l'unico
     * modo per garantire che il pulsante di tap e la barra di progresso siano
     * sempre entrambi visibili, su qualsiasi telefono.
     */
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-stone-950 bg-[radial-gradient(ellipse_at_top,rgba(120,80,30,0.16),transparent_65%)] text-stone-200 lg:h-auto lg:min-h-screen lg:overflow-visible">
      {/* ── Barre superiori: costo fisso, tenuto al minimo ── */}
      <div className="relative z-20 shrink-0 border-b border-stone-900/80 bg-stone-950/80 px-3 pb-2 pt-2 backdrop-blur sm:px-4 lg:mx-auto lg:w-full lg:max-w-7xl lg:border-0 lg:bg-transparent lg:pt-5 lg:backdrop-blur-none">
        <header className="flex items-center gap-2 pb-2">
          <Sprite id="orologio_eternita" size={26} className="shrink-0 sm:h-10 sm:w-10" />
          <h1 className="mr-auto truncate text-sm font-bold tracking-wide text-amber-200 sm:text-lg">
            Relic Loop
            <span className="hidden font-normal text-stone-500 sm:inline">
              {' '}
              — La Bottega del Tempo
            </span>
          </h1>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Attiva l’audio' : 'Disattiva l’audio'}
            aria-pressed={muted}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-stone-700 text-xs text-stone-400 transition active:bg-stone-800 sm:h-9 sm:w-9 sm:text-sm"
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="Come si gioca"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-stone-700 text-xs font-semibold text-stone-400 transition active:bg-stone-800 sm:h-9 sm:w-9 sm:text-sm"
          >
            ?
          </button>
        </header>

        <div className="flex flex-col gap-2">
          <ResourceHud onExplain={() => setHelpOpen(true)} />
          <ErrorBoundary>
            <QuestTracker onGoToTarget={goToTarget} currentTab={tab} />
          </ErrorBoundary>
        </div>

        {/* I toast scendono da qui invece di coprire il pulsante di tap. */}
        <ToastStack />
      </div>

      {/* ── Area di gioco ── */}
      <main className="min-h-0 flex-1 px-3 py-2 sm:px-4 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-[300px_minmax(0,1fr)_320px] lg:gap-4 lg:py-4">
        <TabPane tab="banco" active={tab} className="h-full lg:col-start-2 lg:row-start-1">
          <Panel
            className="flex min-h-0 flex-1 flex-col lg:h-[520px] lg:flex-none"
            highlighted={questTarget === 'banco'}
          >
            <ErrorBoundary>
              <Suspense fallback={<Loading label="Preparo il banco…" />}>
                <Workbench />
              </Suspense>
            </ErrorBoundary>
          </Panel>
          {/* Su desktop c'è spazio: pressione e prestigio restano in colonna. */}
          <div className="hidden lg:flex lg:flex-col lg:gap-4">
            <InspectorMeter />
            <ErrorBoundary>
              <PrestigePanel />
            </ErrorBoundary>
          </div>
        </TabPane>

        <div className="contents lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col lg:gap-4">
          <TabPane tab="mercato" active={tab} className="h-full overflow-y-auto lg:h-auto">
            <Panel highlighted={questTarget === 'mercato'}>
              <ErrorBoundary>
                <Suspense fallback={<Loading label="Il Mercante apre la bottega…" />}>
                  <CrateOpener />
                </Suspense>
              </ErrorBoundary>
            </Panel>
            <Panel className="lg:hidden">
              <ErrorBoundary>
                <InventoryGrid />
              </ErrorBoundary>
            </Panel>
          </TabPane>
          <div className="hidden lg:block">
            <Panel>
              <ErrorBoundary>
                <InventoryGrid />
              </ErrorBoundary>
            </Panel>
          </div>
        </div>

        <div className="contents lg:col-start-3 lg:row-start-1 lg:flex lg:flex-col lg:gap-4">
          <TabPane tab="bottega" active={tab} className="h-full overflow-y-auto lg:h-auto">
            <Panel
              className="lg:flex lg:max-h-[58vh] lg:min-h-0 lg:flex-col"
              highlighted={questTarget === 'bottega'}
            >
              <ErrorBoundary>
                <ShopPanel />
              </ErrorBoundary>
            </Panel>
            {/* Il Salto Temporale vive qui: è una decisione di progressione,
                non un'azione da avere sotto il pollice mentre si tocca. */}
            <div className="lg:hidden">
              <ErrorBoundary>
                <PrestigePanel />
              </ErrorBoundary>
            </div>
          </TabPane>

          <TabPane tab="archivio" active={tab} className="h-full overflow-y-auto lg:h-auto">
            <Panel highlighted={questTarget === 'archivio'}>
              <ErrorBoundary>
                <LoreLog />
              </ErrorBoundary>
            </Panel>
          </TabPane>
        </div>
      </main>

      {/* ── Barra di stato: sempre visibile, costa 34 px ── */}
      <div className="flex shrink-0 items-center gap-2 border-t border-stone-900 bg-stone-950/90 px-3 py-1.5 backdrop-blur lg:hidden">
        <InspectorMeter slim />
        <PrestigeCallout onOpen={() => setTab('bottega')} />
      </div>

      <TabBar
        active={tab}
        onChange={setTab}
        questTarget={questTarget}
        badges={{ archivio: unlockedLore.length > 1 && tab !== 'archivio' }}
      />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <OfflineReportModal />
    </div>
  );
};
