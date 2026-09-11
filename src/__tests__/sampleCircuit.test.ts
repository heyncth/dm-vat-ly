import { describe, expect, it } from 'vitest';
import {
  STAGE_H,
  STAGE_W,
  validateCircuit,
  type PlacedComponent,
  type Wire,
} from '../lib/circuitModel.ts';
import { createSampleCircuit } from '../lib/sampleCircuit.ts';

describe('createSampleCircuit', () => {
  it('contains one of each required part and six wires', () => {
    const sample = createSampleCircuit();
    const types = sample.components.map((c) => c.type).sort();
    expect(types).toEqual(['ammeter', 'resistor', 'supply', 'switch', 'voltmeter']);
    expect(sample.wires).toHaveLength(6);
  });

  it('keeps every component fully inside the stage', () => {
    const sample = createSampleCircuit();
    for (const comp of sample.components) {
      expect(comp.x).toBeGreaterThan(0);
      expect(comp.x).toBeLessThan(STAGE_W);
      expect(comp.y).toBeGreaterThan(0);
      expect(comp.y).toBeLessThan(STAGE_H);
    }
  });

  it('produces a circuit that passes structural validation', () => {
    const sample = createSampleCircuit();
    const result = validateCircuit(sample.components, sample.wires);
    expect(result.reasons).toEqual([]);
    expect(result.valid).toBe(true);
  });
});

describe('validateCircuit', () => {
  it('rejects an empty workspace with one reason per missing part', () => {
    const result = validateCircuit([], []);
    expect(result.valid).toBe(false);
    expect(result.reasons).toHaveLength(5);
  });

  it('rejects a disconnected assembly', () => {
    const sample = createSampleCircuit();
    const result = validateCircuit(sample.components, []);
    expect(result.valid).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('rejects a missing voltmeter', () => {
    const sample = createSampleCircuit();
    const components = sample.components.filter((c) => c.type !== 'voltmeter');
    const wires = sample.wires.filter(
      (w) => !w.from.compId.includes('voltmeter') && !w.to.compId.includes('voltmeter'),
    );
    const result = validateCircuit(components, wires);
    expect(result.valid).toBe(false);
    expect(result.reasons.some((r) => r.includes('Vôn kế') || r.includes('vôn kế'))).toBe(true);
  });

  it('rejects a duplicated part', () => {
    const sample = createSampleCircuit();
    const extra: PlacedComponent = { id: 'c-extra', type: 'resistor', x: 600, y: 400 };
    const result = validateCircuit([...sample.components, extra], sample.wires);
    expect(result.valid).toBe(false);
  });

  it('rejects a voltmeter wired in series instead of parallel', () => {
    const sample = createSampleCircuit();
    const components = sample.components;
    // Rewire: voltmeter inserted into the bottom row instead of across R.
    const seriesWires: Wire[] = [
      { id: 'w1', from: { compId: 'sample-supply', end: 'b' }, to: { compId: 'sample-voltmeter', end: 'a' } },
      { id: 'w2', from: { compId: 'sample-voltmeter', end: 'b' }, to: { compId: 'sample-switch', end: 'a' } },
      { id: 'w3', from: { compId: 'sample-switch', end: 'b' }, to: { compId: 'sample-ammeter', end: 'b' } },
      { id: 'w4', from: { compId: 'sample-ammeter', end: 'a' }, to: { compId: 'sample-resistor', end: 'b' } },
      { id: 'w5', from: { compId: 'sample-resistor', end: 'a' }, to: { compId: 'sample-supply', end: 'a' } },
    ];
    const result = validateCircuit(components, seriesWires);
    expect(result.valid).toBe(false);
    expect(result.reasons.some((r) => r.includes('song song'))).toBe(true);
  });
});
