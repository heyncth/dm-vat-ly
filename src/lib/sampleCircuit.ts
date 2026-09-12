import type { PlacedComponent, Wire, WireEndpoint } from './circuitModel.ts';

export interface SampleCircuit {
  components: PlacedComponent[];
  wires: Wire[];
}

/**
 * Canonical Ohm's Law layout (series loop + voltmeter across the resistor):
 *
 *   supply (200,380) --+-- switch (600,380)
 *       |                 |
 *       |              ammeter (600,150)
 *       |                 |
 *       +-- resistor (200,150)
 *            |
 *         voltmeter (200,260)
 *
 * Loop order: supply(+) → switch → ammeter → resistor → supply(−).
 * Voltmeter across resistor (parallel).
 * All wires are axis-aligned; no crossings.
 */
export function createSampleCircuit(): SampleCircuit {
  const components: PlacedComponent[] = [
    { id: 'sample-supply', type: 'supply', x: 200, y: 380, flipped: true },
    { id: 'sample-switch', type: 'switch', x: 600, y: 380 },
    { id: 'sample-ammeter', type: 'ammeter', x: 600, y: 150 },
    { id: 'sample-resistor', type: 'resistor', x: 200, y: 150 },
    { id: 'sample-voltmeter', type: 'voltmeter', x: 200, y: 260 },
  ];

  const wire = (id: string, from: WireEndpoint, to: WireEndpoint): Wire => ({
    id,
    from,
    to,
  });

  const wires: Wire[] = [
    // supply(+) terminal b (right, shows + when flipped) → switch
    wire('sample-w1', { compId: 'sample-supply', end: 'b' }, { compId: 'sample-switch', end: 'a' }),
    // switch → ammeter
    wire('sample-w2', { compId: 'sample-switch', end: 'b' }, { compId: 'sample-ammeter', end: 'b' }),
    // ammeter → resistor
    wire('sample-w3', { compId: 'sample-ammeter', end: 'a' }, { compId: 'sample-resistor', end: 'b' }),
    // resistor → supply(−) terminal a (left, shows − when flipped)
    wire('sample-w4', { compId: 'sample-resistor', end: 'a' }, { compId: 'sample-supply', end: 'a' }),
    // voltmeter across resistor
    wire('sample-w5', { compId: 'sample-voltmeter', end: 'a' }, { compId: 'sample-resistor', end: 'a' }),
    wire('sample-w6', { compId: 'sample-voltmeter', end: 'b' }, { compId: 'sample-resistor', end: 'b' }),
  ];

  return { components, wires };
}
