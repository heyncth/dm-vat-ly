import type { PlacedComponent, Wire, WireEndpoint } from './circuitModel.ts';

export interface SampleCircuit {
  components: PlacedComponent[];
  wires: Wire[];
}

/**
 * Canonical Ohm's Law layout (series loop + voltmeter across the resistor):
 *
 *   ammeter (600,150) ---- resistor (200,150)
 *       |                        |  |
 *       |                     voltmeter (200,260)
 *       |                        |
 *   switch (600,380) ---- supply (200,380)
 *
 * Loop order: supply → switch → ammeter → resistor → supply.
 * All wires are axis-aligned; no crossings. Deterministic ids so repeated
 * clicks replace rather than duplicate. No physics — positions only.
 */
export function createSampleCircuit(): SampleCircuit {
  const components: PlacedComponent[] = [
    { id: 'sample-supply', type: 'supply', x: 200, y: 380 },
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
    wire('sample-w1', { compId: 'sample-supply', end: 'b' }, { compId: 'sample-switch', end: 'a' }),
    wire('sample-w2', { compId: 'sample-switch', end: 'b' }, { compId: 'sample-ammeter', end: 'b' }),
    wire('sample-w3', { compId: 'sample-ammeter', end: 'a' }, { compId: 'sample-resistor', end: 'b' }),
    wire('sample-w4', { compId: 'sample-resistor', end: 'a' }, { compId: 'sample-supply', end: 'a' }),
    wire('sample-w5', { compId: 'sample-voltmeter', end: 'a' }, { compId: 'sample-resistor', end: 'a' }),
    wire('sample-w6', { compId: 'sample-voltmeter', end: 'b' }, { compId: 'sample-resistor', end: 'b' }),
  ];

  return { components, wires };
}
