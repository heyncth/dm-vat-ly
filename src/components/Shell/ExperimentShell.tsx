import { useEffect, useRef } from 'react';
import type { PanelId } from '../../App.tsx';
import { getTrialMeasurement } from '../../config/experimentConfig.ts';
import { validateCircuit } from '../../lib/circuitModel.ts';
import { useCircuit } from '../../state/useCircuit.ts';
import { useMeasurement } from '../../state/useMeasurement.ts';
import Header from './Header.tsx';
import SimulationWorkspace from '../Workspace/SimulationWorkspace.tsx';
import ControlRail from '../Controls/ControlRail.tsx';
import './ExperimentShell.css';

type ExperimentShellProps = {
  resetSignal: number;
  openPanel: PanelId | null;
  onTogglePanel: (panel: PanelId) => void;
  onClosePanels: () => void;
  onReset: () => void;
};

export default function ExperimentShell({
  resetSignal,
  openPanel,
  onTogglePanel,
  onClosePanels,
  onReset,
}: ExperimentShellProps) {
  const circuit = useCircuit();
  const measurement = useMeasurement();
  const controlsRef = useRef<HTMLDivElement>(null);

  const validation = validateCircuit(circuit.components, circuit.wires);

  // Stale-readout protection: any topology change discards the last reading.
  const topologyKey = JSON.stringify([circuit.components, circuit.wires]);
  const prevTopology = useRef(topologyKey);
  useEffect(() => {
    if (prevTopology.current !== topologyKey) {
      prevTopology.current = topologyKey;
      measurement.clearReadout();
    }
  });

  // When a trial is selected, auto-set U/I from the dataset.
  useEffect(() => {
    const trial = getTrialMeasurement(measurement.selectedLan);
    if (trial) {
      measurement.setManualU(trial.U);
      measurement.setManualI(trial.I);
    }
  }, [measurement.selectedLan]);

  // When simulation stops, capture readout and reset switch.
  const wasRunning = useRef(false);
  useEffect(() => {
    if (wasRunning.current && !circuit.isRunning) {
      // Capture readout
      const u = measurement.manualU;
      const i = measurement.manualI;
      measurement.setReadout({ U: u, I: i });
      // Reset switch visual
      circuit.setSwitchOn(false);
    }
    wasRunning.current = circuit.isRunning;
  }, [circuit.isRunning]);

  const handleReset = () => {
    circuit.resetCircuit();
    measurement.selectLan(null);
    measurement.clearReadout();
    measurement.resetRecording();
    onReset();
  };

  const handleInstrumentEdit = (type: 'U' | 'I', value: number) => {
    if (type === 'U') {
      measurement.setManualU(value);
    } else {
      measurement.setManualI(value);
    }
  };

  // When simulation runs, use the manual instrument values
  const liveReading = circuit.isRunning
    ? { U: measurement.manualU, I: measurement.manualI }
    : null;

  useEffect(() => {
    if (openPanel === 'controls') {
      controlsRef.current?.focus();
    }
  }, [openPanel, resetSignal]);

  useEffect(() => {
    if (!openPanel) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClosePanels();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPanel, onClosePanels]);

  return (
    <div className="app">
      <Header openPanel={openPanel} onTogglePanel={onTogglePanel} onReset={handleReset} />
      <div className="shell-stage" key={resetSignal}>
        <SimulationWorkspace
          circuit={circuit}
          liveReading={liveReading}
          manualU={measurement.manualU}
          manualI={measurement.manualI}
          onInstrumentEdit={handleInstrumentEdit}
        />
        {openPanel && (
          <div className="sidebar" ref={controlsRef} tabIndex={-1}>
            <ControlRail
              circuit={circuit}
              measurement={measurement}
              validation={validation}
              onSample={() => { circuit.loadSample(); measurement.clearReadout(); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
