import type { CircuitApi } from '../../state/useCircuit.ts';
import CircuitCanvas from './CircuitCanvas.tsx';
import './SimulationWorkspace.css';

type Props = {
  circuit: CircuitApi;
  liveReading?: { U: number; I: number } | null;
  manualU?: number;
  manualI?: number;
  onInstrumentEdit?: (type: 'U' | 'I', value: number) => void;
};

export default function SimulationWorkspace({ circuit, liveReading, manualU, manualI, onInstrumentEdit }: Props) {
  return (
    <section className="workspace" aria-labelledby="workspace-heading" data-testid="simulation-workspace">
      <h2 id="workspace-heading" className="section-heading">
        Khu vực mô phỏng
      </h2>
      <div className="workspace-stage">
        <CircuitCanvas
          circuit={circuit}
          liveReading={liveReading}
          manualU={manualU}
          manualI={manualI}
          onInstrumentEdit={onInstrumentEdit}
        />
      </div>
    </section>
  );
}
