import type { ValidationResult } from '../../lib/circuitModel.ts';
import type { CircuitApi } from '../../state/useCircuit.ts';
import type { MeasurementApi } from '../../state/useMeasurement.ts';
import './ControlRail.css';

const TRIALS: [1, 2, 3, 4, 5] = [1, 2, 3, 4, 5];

type ControlRailProps = {
  circuit: CircuitApi;
  measurement: MeasurementApi;
  validation: ValidationResult;
  onSample: () => void;
};

export default function ControlRail({
  circuit,
  measurement,
  validation,
  onSample,
}: ControlRailProps) {
  const { isRunning } = circuit;
  const { selectedLan } = measurement;

  const hasInstrument = circuit.components.some(
    (c) => c.type === 'ammeter' || c.type === 'voltmeter',
  );
  const hasSwitchPart = circuit.components.some((c) => c.type === 'switch');
  const canRun = validation.valid && hasSwitchPart && hasInstrument;

  let runReason: string | null = null;
  if (!canRun) {
    if (!validation.valid) {
      runReason = 'Mạch chưa đầy đủ — thêm linh kiện và nối dây.';
    } else if (!hasSwitchPart) {
      runReason = 'Thêm công tắc vào mạch.';
    } else if (!hasInstrument) {
      runReason = 'Thêm Vôn kế hoặc Ampe kế.';
    }
  }

  return (
    <aside id="panel-controls" className="control-rail" aria-label="Điều khiển thí nghiệm" data-testid="control-rail">
      <section className="rail-group" aria-labelledby="rail-circuit-heading">
        <h2 id="rail-circuit-heading" className="section-heading">
          Mạch
        </h2>
        <p className="rail-status" role="status">
          {validation.valid ? '✓ Mạch hợp lệ' : 'Chưa sẵn sàng'}
        </p>
        <button type="button" className="secondary-btn" onClick={onSample}>
          Mạch mẫu
        </button>
      </section>

      <section className="rail-group" aria-labelledby="rail-sim-heading">
        <h2 id="rail-sim-heading" className="section-heading">
          Mô phỏng
        </h2>
        {isRunning ? (
          <button
            type="button"
            className="play-btn play-btn--running"
            onClick={() => circuit.setRunning(false)}
          >
            ■  DỪNG MÔ PHỎNG
          </button>
        ) : (
          <button
            type="button"
            className="play-btn"
            disabled={!canRun}
            title={runReason ?? 'Chạy mô phỏng'}
            onClick={() => {
              circuit.setSwitchOn(true);
              circuit.setRunning(true);
            }}
          >
            ▶  CHẠY MÔ PHỎNG
          </button>
        )}
        {runReason && !isRunning && (
          <p className="rail-reason">{runReason}</p>
        )}
      </section>

      <section className="rail-group" aria-labelledby="rail-trials-heading">
        <h2 id="rail-trials-heading" className="section-heading">
          Lần đo
        </h2>
        <div className="rail-trial-display">
          <div className="trial-dots" role="group" aria-label="Chọn lần đo">
            {TRIALS.map((n) => {
              const isActive = selectedLan === n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={isActive}
                  className={`trial-dot${isActive ? ' trial-dot--active' : ''}`}
                  title={`Lần ${n}`}
                  onClick={() => measurement.selectLan(isActive ? null : n)}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </aside>
  );
}
