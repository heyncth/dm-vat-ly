import { describe, expect, it } from 'vitest';
import { computeR, computeStats, isTrialRecorded, roundTo } from '../config/experimentConfig.ts';
import type { RecordedRow } from '../config/experimentConfig.ts';

describe('experimentConfig', () => {
  it('rounds to the correct number of decimal places', () => {
    expect(roundTo(10.005, 2)).toBe(10.01);
    expect(roundTo(10.004, 2)).toBe(10.00);
    expect(roundTo(1.2345, 3)).toBe(1.235);
  });

  it('computes R from U/I', () => {
    expect(computeR(4.01, 0.399)).toBe(10.05);
    expect(computeR(6.01, 0.601)).toBe(10.00);
    expect(computeR(2.01, 0.201)).toBe(10.00);
  });

  it('detects duplicate trial recordings', () => {
    const rows: RecordedRow[] = [
      { rowIndex: 1, lan: 1, U: 2.01, I: 0.201, R: 10.00 },
      { rowIndex: 2, lan: 3, U: 4.01, I: 0.399, R: 10.05 },
    ];
    expect(isTrialRecorded(rows, 1)).toBe(true);
    expect(isTrialRecorded(rows, 2)).toBe(false);
    expect(isTrialRecorded(rows, 3)).toBe(true);
  });

  it('returns null stats for fewer than 2 rows', () => {
    expect(computeStats([])).toBeNull();
    expect(computeStats([{ rowIndex: 1, lan: 1, U: 2.01, I: 0.201, R: 10.00 }])).toBeNull();
  });

  it('computes stats for 2 rows', () => {
    const rows: RecordedRow[] = [
      { rowIndex: 1, lan: 1, U: 2.01, I: 0.201, R: 10.00 },
      { rowIndex: 2, lan: 2, U: 3.02, I: 0.301, R: 10.03 },
    ];
    const stats = computeStats(rows)!;
    expect(stats.Rbar).toBe(10.02);
    // SS = (10.00−10.02)² + (10.03−10.02)² = 0.0004 + 0.0001 = 0.0005 → rounded 4dp
    expect(stats.SS).toBe(0.0005);
    // Se = √(0.0005/1) = √0.0005 ≈ 0.0224 → rounded 2dp
    expect(stats.Se).toBe(0.02);
    // greatestDiff = max(|10.00−10.02|, |10.03−10.02|) = 0.02
    expect(stats.greatestDiff).toBe(0.02);
  });

  it('computes stats for 5 trials and rates Đạt', () => {
    const rows: RecordedRow[] = [
      { rowIndex: 1, lan: 1, U: 2.01, I: 0.201, R: 10.00 },
      { rowIndex: 2, lan: 2, U: 3.02, I: 0.301, R: 10.03 },
      { rowIndex: 3, lan: 3, U: 4.01, I: 0.399, R: 10.05 },
      { rowIndex: 4, lan: 4, U: 5.02, I: 0.501, R: 10.02 },
      { rowIndex: 5, lan: 5, U: 6.01, I: 0.601, R: 10.00 },
    ];
    const stats = computeStats(rows)!;
    // R̄ = (10.00+10.03+10.05+10.02+10.00)/5 = 50.10/5 = 10.02
    expect(stats.Rbar).toBe(10.02);
    // SS = 0.0004 + 0.0001 + 0.0009 + 0.0000 + 0.0004 = 0.0018 → rounded 4dp
    expect(stats.SS).toBe(0.0018);
    // Se = √(0.0018/4) = √0.00045 ≈ 0.0212 → rounded 2dp
    expect(stats.Se).toBe(0.02);
    // greatestDiff = max(0.02, 0.01, 0.03, 0.00, 0.02) = 0.03
    expect(stats.greatestDiff).toBe(0.03);
    // diffPct = 0.03/10.02 = 0.3% → Đạt
    expect(stats.quality).toBe('Đạt');
  });
});
