import { experimentConfig, type RecordedRow, type ExperimentStats } from '../../config/experimentConfig.ts';
import './ResultsTable.css';

type ResultsTableProps = {
  rows: RecordedRow[];
  stats: ExperimentStats | null;
};

export default function ResultsTable({ rows, stats }: ResultsTableProps) {
  const fmtU = (v: number) => v.toFixed(experimentConfig.precision.U);
  const fmtI = (v: number) => v.toFixed(experimentConfig.precision.I);
  const fmtR = (v: number) => v.toFixed(experimentConfig.precision.R);

  return (
    <section id="panel-results" className="results" aria-labelledby="results-heading" data-testid="results-table">
      <h2 id="results-heading" className="section-heading">
        Bảng kết quả
      </h2>
      <div className="results-scroll">
        <table className="results-table">
          <caption className="visually-hidden">Kết quả các lần đo hiệu điện thế, cường độ điện trở</caption>
          <thead>
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Lần</th>
              <th scope="col">U (V)</th>
              <th scope="col">I (A)</th>
              <th scope="col">R (Ω)</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="results-empty">
                  Chưa có phép đo
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.lan}>
                  <td>{row.rowIndex}</td>
                  <td>{row.lan}</td>
                  <td>{fmtU(row.U)}</td>
                  <td>{fmtI(row.I)}</td>
                  <td>{fmtR(row.R)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {stats && (
        <div className="results-stats" aria-label="Kết quả phân tích">
          <h3 className="section-heading">Phân tích</h3>
          <dl className="stats-grid">
            <div className="stat-item">
              <dt>R̄ (Ω)</dt>
              <dd>{fmtR(stats.Rbar)}</dd>
            </div>
            <div className="stat-item">
              <dt>SS</dt>
              <dd>{fmtR(stats.SS)}</dd>
            </div>
            <div className="stat-item">
              <dt>Se (Ω)</dt>
              <dd>{fmtR(stats.Se)}</dd>
            </div>
            <div className="stat-item">
              <dt>ΔRmax (Ω)</dt>
              <dd>{fmtR(stats.greatestDiff)}</dd>
            </div>
            <div className="stat-item stat-item--quality">
              <dt>Đánh giá</dt>
              <dd>{stats.quality}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
