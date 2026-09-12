/**
 * Circuit model — pure types, constants, and helpers for Phase 2.
 * No physics, no validation, no hidden resistance. Positions only.
 */

export type ComponentType = 'supply' | 'resistor' | 'ammeter' | 'voltmeter' | 'switch';

export type TerminalEnd = 'a' | 'b';

export interface Point {
  x: number;
  y: number;
}

export interface PlacedComponent {
  id: string;
  type: ComponentType;
  /** Center position in SVG stage units. */
  x: number;
  y: number;
  /** Horizontal flip — swaps terminal 'a' and 'b' positions. */
  flipped?: boolean;
}

export interface WireEndpoint {
  compId: string;
  end: TerminalEnd;
}

export interface Wire {
  id: string;
  from: WireEndpoint;
  to: WireEndpoint;
}

export type Selection = { kind: 'comp' | 'wire'; id: string } | null;

/** Fixed stage coordinate system; the SVG scales it responsively. */
export const STAGE_W = 800;
export const STAGE_H = 500;
export const GRID = 20;
const STAGE_PAD = 8;

export const COMPONENT_DEFS: Record<
  ComponentType,
  { label: string; w: number; h: number }
> = {
  supply: { label: 'Nguồn điện', w: 84, h: 52 },
  resistor: { label: 'Điện trở', w: 84, h: 40 },
  ammeter: { label: 'Ampe kế', w: 64, h: 64 },
  voltmeter: { label: 'Vôn kế', w: 64, h: 64 },
  switch: { label: 'Công tắc', w: 84, h: 44 },
};

export const PALETTE_ORDER: ComponentType[] = [
  'supply',
  'resistor',
  'ammeter',
  'voltmeter',
  'switch',
];

/** Snap a stage coordinate to the grid. */
export function snapValue(value: number): Point['x'] {
  return Math.round(value / GRID) * GRID;
}

/** Snap + clamp a component center so it stays fully inside the stage. */
export function clampPosition(type: ComponentType, x: number, y: number): Point {
  const def = COMPONENT_DEFS[type];
  const minX = def.w / 2 + STAGE_PAD;
  const maxX = STAGE_W - def.w / 2 - STAGE_PAD;
  const minY = def.h / 2 + STAGE_PAD;
  const maxY = STAGE_H - def.h / 2 - STAGE_PAD;
  return {
    x: Math.min(maxX, Math.max(minX, snapValue(x))),
    y: Math.min(maxY, Math.max(minY, snapValue(y))),
  };
}

/** Absolute stage position of a component terminal. Terminals sit mid-left/right. */
export function terminalPosition(comp: PlacedComponent, end: TerminalEnd): Point {
  const def = COMPONENT_DEFS[comp.type];
  return {
    x: comp.x + (end === 'a' ? -def.w / 2 : def.w / 2),
    y: comp.y,
  };
}

export function sameEndpoint(a: WireEndpoint, b: WireEndpoint): boolean {
  return a.compId === b.compId && a.end === b.end;
}

/** True if a wire with these endpoints (either direction) already exists. */
export function isDuplicateWire(wires: Wire[], from: WireEndpoint, to: WireEndpoint): boolean {
  return wires.some(
    (w) =>
      (sameEndpoint(w.from, from) && sameEndpoint(w.to, to)) ||
      (sameEndpoint(w.from, to) && sameEndpoint(w.to, from)),
  );
}

function overlaps(a: Point, aType: ComponentType, b: PlacedComponent): boolean {
  const bDef = COMPONENT_DEFS[b.type];
  const aDef = COMPONENT_DEFS[aType];
  return (
    Math.abs(a.x - b.x) < (aDef.w + bDef.w) / 2 + GRID &&
    Math.abs(a.y - b.y) < (aDef.h + bDef.h) / 2 + GRID
  );
}

/** Find a free grid spot near the stage center for click-to-place. */
export function findFreeSpot(type: ComponentType, components: PlacedComponent[]): Point {
  const start = clampPosition(type, STAGE_W / 2, STAGE_H / 2 - 40);
  if (!components.some((c) => overlaps(start, type, c))) {
    return start;
  }
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      const candidate = clampPosition(type, 120 + col * 64, 100 + row * 52);
      if (!components.some((c) => overlaps(candidate, type, c))) {
        return candidate;
      }
    }
  }
  return start;
}

/** Convert a client (pointer) position to stage units. Falls back to rect math. */
export function toStagePoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): Point {
  try {
    const ctm = svg.getScreenCTM();
    if (ctm && typeof DOMPoint !== 'undefined') {
      const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
      return { x: pt.x, y: pt.y };
    }
  } catch {
    // jsdom / old browsers: use the rect fallback below.
  }
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const scaleX = vb && vb.width ? vb.width / Math.max(1, rect.width) : 1;
  const scaleY = vb && vb.height ? vb.height / Math.max(1, rect.height) : 1;
  return {
    x: (clientX - rect.left) * scaleX + (vb ? vb.x : 0),
    y: (clientY - rect.top) * scaleY + (vb ? vb.y : 0),
  };
}

// ---------------------------------------------------------------------------
// Structural validation (no physics). Shared by MẠCH MẪU tests and the
// Phase 4 measurement gate: both use this single function.
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  reasons: string[];
}

const REQUIRED_TYPES: ComponentType[] = [
  'supply',
  'switch',
  'ammeter',
  'resistor',
  'voltmeter',
];

function terminalKey(endpoint: WireEndpoint): string {
  return `${endpoint.compId}:${endpoint.end}`;
}

/**
 * Check that the circuit has exactly one of each required part, a closed
 * series loop supply → switch → ammeter → resistor → supply (any direction),
 * and the voltmeter in parallel across the resistor. Connectivity is computed
 * with union-find over terminals joined by wires.
 */
export function validateCircuit(
  components: PlacedComponent[],
  wires: Wire[],
): ValidationResult {
  const reasons: string[] = [];
  const byId = new Map(components.map((c) => [c.id, c]));

  for (const type of REQUIRED_TYPES) {
    const count = components.filter((c) => c.type === type).length;
    const label = COMPONENT_DEFS[type].label.toLowerCase();
    if (count === 0) {
      reasons.push(`Thiếu ${label} trong mạch.`);
    } else if (count > 1) {
      reasons.push(`Chỉ cần 1 ${label}, đang có ${count}.`);
    }
  }

  if (wires.some((w) => !byId.has(w.from.compId) || !byId.has(w.to.compId))) {
    reasons.push('Có dây nối vào chốt không tồn tại.');
  }

  if (reasons.length > 0) {
    return { valid: false, reasons };
  }

  const parent = new Map<string, string>();
  const find = (key: string): string => {
    const direct = parent.get(key);
    if (direct === undefined) {
      return key;
    }
    const root = find(direct);
    parent.set(key, root);
    return root;
  };
  const union = (a: string, b: string) => {
    parent.set(find(a), find(b));
  };
  for (const wire of wires) {
    union(terminalKey(wire.from), terminalKey(wire.to));
  }

  const one = (type: ComponentType): PlacedComponent =>
    components.find((c) => c.type === type) as PlacedComponent;
  const nodeOf = (comp: PlacedComponent, end: TerminalEnd): string =>
    find(`${comp.id}:${end}`);
  const linked = (a: PlacedComponent, b: PlacedComponent): boolean =>
    (['a', 'b'] as TerminalEnd[]).some((ea) =>
      (['a', 'b'] as TerminalEnd[]).some((eb) => nodeOf(a, ea) === nodeOf(b, eb)),
    );

  const series: Array<[ComponentType, ComponentType]> = [
    ['supply', 'switch'],
    ['switch', 'ammeter'],
    ['ammeter', 'resistor'],
    ['resistor', 'supply'],
  ];
  for (const [first, second] of series) {
    if (!linked(one(first), one(second))) {
      reasons.push(
        `${COMPONENT_DEFS[first].label} chưa nối với ${COMPONENT_DEFS[second].label.toLowerCase()}.`,
      );
    }
  }

  const resistor = one('resistor');
  const voltmeter = one('voltmeter');
  const parallel =
    (nodeOf(resistor, 'a') === nodeOf(voltmeter, 'a') &&
      nodeOf(resistor, 'b') === nodeOf(voltmeter, 'b')) ||
    (nodeOf(resistor, 'a') === nodeOf(voltmeter, 'b') &&
      nodeOf(resistor, 'b') === nodeOf(voltmeter, 'a'));
  if (!parallel) {
    reasons.push('Vôn kế chưa mắc song song với điện trở.');
  }

  // Polarity check: if ammeter or voltmeter is flipped, polarity is wrong.
  const ammeter = one('ammeter');
  const voltmeter2 = one('voltmeter');
  if (ammeter.flipped) {
    reasons.push('Cực Ampe kế bị đảo — kiểm tra chiều nối +/-.');
  }
  if (voltmeter2.flipped) {
    reasons.push('Cực Vôn kế bị đảo — kiểm tra chiều nối +/-.');
  }

  return { valid: reasons.length === 0, reasons };
}
