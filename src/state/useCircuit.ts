import { useRef, useState } from 'react';
import {
  clampPosition,
  findFreeSpot,
  sameEndpoint,
  type ComponentType,
  type PlacedComponent,
  type Point,
  type Selection,
  type Wire,
  type WireEndpoint,
} from '../lib/circuitModel.ts';
import { createSampleCircuit } from '../lib/sampleCircuit.ts';

export type ActiveTool = 'select' | 'wire';

/** 'sample' right after MẠCH MẪU; any manual edit flips back to 'manual'. */
export type CircuitMode = 'manual' | 'sample';

export interface CircuitApi {
  components: PlacedComponent[];
  wires: Wire[];
  selected: Selection;
  activeTool: ActiveTool;
  pending: WireEndpoint | null;
  mode: CircuitMode;
  /** Lab switch state. Independent of topology mode; cleared on reset. */
  switchOn: boolean;
  /** Simulation running — particles animate, instruments show live readings. */
  isRunning: boolean;
  setSwitchOn: (on: boolean) => void;
  setRunning: (running: boolean) => void;
  addComponent: (type: ComponentType, at?: Point) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  dropComponent: (id: string, x: number, y: number) => void;
  setSelected: (selection: Selection) => void;
  removeSelected: () => void;
  setActiveTool: (tool: ActiveTool) => void;
  activateTerminal: (endpoint: WireEndpoint) => void;
  cancelPending: () => void;
  loadSample: () => void;
  resetCircuit: () => void;
}

/**
 * Circuit editing state. Lives inside the keyed stage in ExperimentShell,
 * so ĐẶT LẠI remounts it back to empty. No validation here (Phase 4+).
 */
export function useCircuit(): CircuitApi {
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selected, setSelected] = useState<Selection>(null);
  const [activeTool, setActiveToolState] = useState<ActiveTool>('select');
  const [pending, setPending] = useState<WireEndpoint | null>(null);
  const [mode, setMode] = useState<CircuitMode>('manual');
  const [switchOn, setSwitchOn] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const idCounter = useRef(0);

  const nextId = (prefix: string) => {
    idCounter.current += 1;
    return `${prefix}${idCounter.current}`;
  };

  const addComponent = (type: ComponentType, at?: Point) => {
    const spot = at ?? findFreeSpot(type, components);
    const id = nextId('c');
    setComponents((prev) => [...prev, { id, type, x: spot.x, y: spot.y }]);
    setSelected({ kind: 'comp', id });
    setActiveToolState('select');
    setMode('manual');
  };

  const moveComponent = (id: string, x: number, y: number) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, x, y } : c)));
  };

  const dropComponent = (id: string, x: number, y: number) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...clampPosition(c.type, x, y) } : c)),
    );
    setMode('manual');
  };

  const removeSelected = () => {
    if (!selected) {
      return;
    }
    if (selected.kind === 'comp') {
      const id = selected.id;
      setComponents((prev) => prev.filter((c) => c.id !== id));
      setWires((prev) =>
        prev.filter((w) => w.from.compId !== id && w.to.compId !== id),
      );
    } else {
      const id = selected.id;
      setWires((prev) => prev.filter((w) => w.id !== id));
    }
    if (pending && selected.kind === 'comp' && pending.compId === selected.id) {
      setPending(null);
    }
    setSelected(null);
    setMode('manual');
  };

  const setActiveTool = (tool: ActiveTool) => {
    setActiveToolState(tool);
    setPending(null);
  };

  const setRunning = (running: boolean) => {
    setIsRunning(running);
  };

  const activateTerminal = (endpoint: WireEndpoint) => {
    if (!pending) {
      setPending(endpoint);
      return;
    }
    if (sameEndpoint(pending, endpoint)) {
      return; // second click on the same terminal: keep waiting.
    }
    const from = pending;
    const to = endpoint;
    setPending(null);

    // Toggle: if wire exists, remove it (unwire)
    const existingWire = wires.find(
      (w) =>
        (sameEndpoint(w.from, from) && sameEndpoint(w.to, to)) ||
        (sameEndpoint(w.from, to) && sameEndpoint(w.to, from)),
    );
    if (existingWire) {
      setWires((prev) => prev.filter((w) => w.id !== existingWire.id));
      setMode('manual');
      return;
    }

    // Otherwise create new wire
    setMode('manual');
    const id = nextId('w');
    setWires((prev) => [...prev, { id, from, to }]);
  };

  const cancelPending = () => {
    setPending(null);
  };

  const loadSample = () => {
    const sample = createSampleCircuit();
    setComponents(sample.components);
    setWires(sample.wires);
    setSelected(null);
    setPending(null);
    setActiveToolState('select');
    setMode('sample');
  };

  const resetCircuit = () => {
    setComponents([]);
    setWires([]);
    setSelected(null);
    setPending(null);
    setActiveToolState('select');
    setMode('manual');
    setSwitchOn(false);
    setIsRunning(false);
  };

  return {
    components,
    wires,
    selected,
    activeTool,
    pending,
    mode,
    switchOn,
    isRunning,
    setSwitchOn,
    setRunning,
    addComponent,
    moveComponent,
    dropComponent,
    setSelected,
    removeSelected,
    setActiveTool,
    activateTerminal,
    cancelPending,
    loadSample,
    resetCircuit,
  };
}
