/**
 * Experiment configuration — the single source of truth for measurement data.
 * These values are what the virtual instruments report; there is no hidden
 * physical model, no R_true, no circuit solver. UI components must never
 * hardcode U/I values: always look them up here.
 */

export type TrialLan = 1 | 2 | 3 | 4 | 5;

export interface TrialMeasurement {
  lan: TrialLan;
  U: number;
  I: number;
}

export interface RecordedRow {
  rowIndex: number;
  lan: TrialLan;
  U: number;
  I: number;
  /** R = U / I, rounded to precision.R decimal places. */
  R: number;
}

export type QualityRating = 'Đạt' | 'Khá' | 'Không đạt';

export interface ExperimentStats {
  Rbar: number;
  SS: number;
  Se: number;
  greatestDiff: number;
  quality: QualityRating;
}

export const experimentConfig = {
  trials: [
    { lan: 1, U: 2.01, I: 0.201 },
    { lan: 2, U: 3.02, I: 0.301 },
    { lan: 3, U: 4.01, I: 0.399 },
    { lan: 4, U: 5.02, I: 0.501 },
    { lan: 5, U: 6.01, I: 0.601 },
  ] as TrialMeasurement[],
  precision: { U: 2, I: 3, R: 2, stats: 4 },
  units: { U: 'V', I: 'A', R: 'Ω' },
  /** Threshold for the greatest-difference quality gate (% of R̄). */
  qualityThresholds: { excellent: 0.02, good: 0.05 },
};

/** Look up the instrument readings for a trial. Returns null when unselected. */
export function getTrialMeasurement(lan: TrialLan | null): TrialMeasurement | null {
  if (lan === null) {
    return null;
  }
  return experimentConfig.trials.find((t) => t.lan === lan) ?? null;
}

/** Round to n decimal places (banker-safe via string rounding). */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Compute R from a U/I pair. */
export function computeR(U: number, I: number): number {
  return roundTo(U / I, experimentConfig.precision.R);
}

/** True when a trial with the given number has already been recorded. */
export function isTrialRecorded(rows: RecordedRow[], lan: TrialLan): boolean {
  return rows.some((r) => r.lan === lan);
}

/**
 * Compute experiment-wide statistics from all recorded rows.
 * Requires at least 2 rows to produce meaningful results.
 */
export function computeStats(rows: RecordedRow[]): ExperimentStats | null {
  if (rows.length < 2) {
    return null;
  }

  const Rvals = rows.map((r) => r.R);
  const n = Rvals.length;
  const Rbar = roundTo(Rvals.reduce((a, b) => a + b, 0) / n, experimentConfig.precision.R);

  // SS = Σ(Ri − R̄)²
  const SSraw = Rvals.reduce((sum, R) => sum + (R - Rbar) ** 2, 0);
  const SS = roundTo(SSraw, experimentConfig.precision.stats);

  // Se = √(SS / (n−1))  (sample standard deviation)
  const Se = roundTo(Math.sqrt(SSraw / (n - 1)), experimentConfig.precision.R);

  // Greatest absolute difference from the mean
  const greatestDiff = roundTo(
    Math.max(...Rvals.map((R) => Math.abs(R - Rbar))),
    experimentConfig.precision.R,
  );

  const diffPct = greatestDiff / Rbar;
  let quality: QualityRating;
  if (diffPct <= experimentConfig.qualityThresholds.excellent) {
    quality = 'Đạt';
  } else if (diffPct <= experimentConfig.qualityThresholds.good) {
    quality = 'Khá';
  } else {
    quality = 'Không đạt';
  }

  return { Rbar, SS, Se, greatestDiff, quality };
}
