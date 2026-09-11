import { useState } from 'react';
import ExperimentShell from './components/Shell/ExperimentShell.tsx';

export type PanelId = 'controls' | 'results';

/**
 * Phase 1 shell state.
 *
 * `resetSignal` is the single reset extension point for later phases:
 * Phase 2+ lifts circuit / measurement state above (or beside) the keyed
 * grid in ExperimentShell and clears it in `handleReset`.
 * Sidebar shows both controls + results when open; reset closes it.
 * No persistence (no localStorage) by design.
 */
export default function App() {
  const [resetSignal, setResetSignal] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const togglePanel = (_panel: PanelId) => {
    setSidebarOpen((v) => !v);
  };

  const closePanels = () => {
    setSidebarOpen(false);
  };

  const handleReset = () => {
    setSidebarOpen(false);
    setResetSignal((n) => n + 1);
    setAnnouncement('Đã đặt lại giao diện thí nghiệm.');
  };

  return (
    <>
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
      <ExperimentShell
        resetSignal={resetSignal}
        openPanel={sidebarOpen ? 'controls' : null}
        onTogglePanel={togglePanel}
        onClosePanels={closePanels}
        onReset={handleReset}
      />
    </>
  );
}
