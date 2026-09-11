import { useState } from 'react';
import type { TrialLan, RecordedRow, ExperimentStats } from '../config/experimentConfig.ts';
import { computeR, computeStats, isTrialRecorded } from '../config/experimentConfig.ts';

export interface MeasurementApi {
  selectedLan: TrialLan | null;
  readout: { U: number; I: number } | null;
  recordedRows: RecordedRow[];
  stats: ExperimentStats | null;
  /** User-set instrument values for manual input mode */
  manualU: number;
  manualI: number;
  selectLan: (lan: TrialLan | null) => void;
  setReadout: (readout: { U: number; I: number } | null) => void;
  clearReadout: () => void;
  setManualU: (value: number) => void;
  setManualI: (value: number) => void;
  recordCurrent: (override?: { U: number; I: number }) => void;
  resetRecording: () => void;
}

export function useMeasurement(): MeasurementApi {
  const [selectedLan, setSelectedLan] = useState<TrialLan | null>(null);
  const [readout, setReadoutState] = useState<{ U: number; I: number } | null>(null);
  const [recordedRows, setRecordedRows] = useState<RecordedRow[]>([]);
  const [manualU, setManualU] = useState(9.0);
  const [manualI, setManualI] = useState(0.5);

  const selectLan = (lan: TrialLan | null) => {
    if (lan !== selectedLan) {
      setReadoutState(null);
    }
    setSelectedLan(lan);
  };

  const setReadout = (value: { U: number; I: number } | null) => {
    setReadoutState(value);
  };

  const clearReadout = () => {
    setReadoutState(null);
  };

  const recordCurrent = (override?: { U: number; I: number }) => {
    const u = override?.U ?? readout?.U;
    const i = override?.I ?? readout?.I;
    if (u == null || i == null || !selectedLan || isTrialRecorded(recordedRows, selectedLan)) {
      return;
    }
    const R = computeR(u, i);
    setRecordedRows((prev) => [
      ...prev,
      { rowIndex: prev.length + 1, lan: selectedLan, U: u, I: i, R },
    ]);
    // After recording, deselect the trial and clear readout.
    setSelectedLan(null);
    setReadoutState(null);
  };

  const resetRecording = () => {
    setRecordedRows([]);
    setReadoutState(null);
    setSelectedLan(null);
  };

  const stats = computeStats(recordedRows);

  return {
    selectedLan,
    readout,
    recordedRows,
    stats,
    manualU,
    manualI,
    selectLan,
    setReadout,
    clearReadout,
    setManualU,
    setManualI,
    recordCurrent,
    resetRecording,
  };
}
