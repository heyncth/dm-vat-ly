import { describe, expect, it } from 'vitest';
import {
  STAGE_H,
  STAGE_W,
  clampPosition,
  findFreeSpot,
  isDuplicateWire,
  sameEndpoint,
  snapValue,
  terminalPosition,
  type PlacedComponent,
  type Wire,
} from '../lib/circuitModel.ts';

describe('circuitModel', () => {
  it('snaps values to the 20-unit grid', () => {
    expect(snapValue(31)).toBe(40);
    expect(snapValue(29)).toBe(20);
    expect(snapValue(0)).toBe(0);
  });

  it('clamps positions inside the stage', () => {
    expect(clampPosition('resistor', -500, 10000)).toEqual({ x: 50, y: 472 });
    expect(clampPosition('resistor', STAGE_W / 2, STAGE_H / 2)).toEqual({
      x: 400,
      y: 260,
    });
  });

  it('places terminals mid-left and mid-right of a component', () => {
    const comp: PlacedComponent = { id: 'c1', type: 'resistor', x: 400, y: 260 };
    // resistor w = 84 → half-width 42
    expect(terminalPosition(comp, 'a')).toEqual({ x: 358, y: 260 });
    expect(terminalPosition(comp, 'b')).toEqual({ x: 442, y: 260 });
  });

  it('compares endpoints and detects duplicate wires', () => {
    const from = { compId: 'c1', end: 'a' as const };
    const to = { compId: 'c2', end: 'b' as const };
    expect(sameEndpoint(from, { compId: 'c1', end: 'a' })).toBe(true);
    expect(sameEndpoint(from, to)).toBe(false);

    const wires: Wire[] = [{ id: 'w1', from, to }];
    expect(isDuplicateWire(wires, from, to)).toBe(true);
    expect(isDuplicateWire(wires, to, from)).toBe(true); // either direction
    expect(
      isDuplicateWire(wires, from, { compId: 'c2', end: 'a' }),
    ).toBe(false);
  });

  it('finds a free spot that avoids existing components', () => {
    const existing: PlacedComponent[] = [
      { id: 'c1', type: 'supply', x: 400, y: 220 },
    ];
    const spot = findFreeSpot('resistor', existing);
    expect(spot.x).toBeGreaterThanOrEqual(50);
    expect(spot.x).toBeLessThanOrEqual(STAGE_W - 50);
    // Must not overlap the supply at center.
    expect(Math.abs(spot.x - 400) > 60 || Math.abs(spot.y - 220) > 40).toBe(true);
  });
});
