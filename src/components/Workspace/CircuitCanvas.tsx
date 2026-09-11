import { useCallback, useEffect, useRef, useState } from 'react';
import {
  COMPONENT_DEFS,
  GRID,
  STAGE_H,
  STAGE_W,
  clampPosition,
  type ComponentType,
  type WireEndpoint,
} from '../../lib/circuitModel.ts';
import type { CircuitApi } from '../../state/useCircuit.ts';
import ComponentNode from './ComponentNode.tsx';
import ComponentPalette from './ComponentPalette.tsx';
import WireLayer from './WireLayer.tsx';
import './CircuitCanvas.css';

const DRAG_THRESHOLD_PX = 6;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;

type Ghost = { type: ComponentType; clientX: number; clientY: number };

type CircuitCanvasProps = {
  circuit: CircuitApi;
  liveReading?: { U: number; I: number } | null;
  manualU?: number;
  manualI?: number;
  onInstrumentEdit?: (type: 'U' | 'I', value: number) => void;
};

export default function CircuitCanvas({ circuit, liveReading, manualU, manualI, onInstrumentEdit }: CircuitCanvasProps) {
  const { components, wires, selected, activeTool, pending } = circuit;
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeDrag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const placeDrag = useRef<{
    type: ComponentType;
    startX: number;
    startY: number;
    overStage: { x: number; y: number } | null;
  } | null>(null);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [, setDragTick] = useState(0);
  const lastPointerPlace = useRef(0);

  // ---- zoom & pan state ----
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const panDrag = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const isPanning = useRef(false);

  // Keep refs in sync
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  // Convert client coords → stage coords accounting for zoom/pan
  const svgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const vbW = STAGE_W;
    const vbH = STAGE_H;
    const scaleX = vbW / rect.width;
    const scaleY = vbH / rect.height;
    // client → SVG viewport
    const svgX = (clientX - rect.left) * scaleX;
    const svgY = (clientY - rect.top) * scaleY;
    // SVG viewport → stage (undo zoom + pan)
    const stageX = (svgX - pan.x) / zoom;
    const stageY = (svgY - pan.y) / zoom;
    return { x: stageX, y: stageY };
  }, [zoom, pan]);

  // ---- wheel zoom (centered on cursor) ---- native listener, passive:false to block browser zoom
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const svgX = (e.clientX - rect.left) * (STAGE_W / rect.width);
      const svgY = (e.clientY - rect.top) * (STAGE_H / rect.height);

      const oldZoom = zoomRef.current;
      const oldPan = panRef.current;
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom * factor));
      const ratio = newZoom / oldZoom;
      const newPan = {
        x: svgX - ratio * (svgX - oldPan.x),
        y: svgY - ratio * (svgY - oldPan.y),
      };
      zoomRef.current = newZoom;
      panRef.current = newPan;
      setZoom(newZoom);
      setPan(newPan);
    };
    svg.addEventListener('wheel', handler, { passive: false });
    return () => svg.removeEventListener('wheel', handler);
  }, []);

  // ---- middle-click / alt+drag pan ----
  const handleSvgPointerDown = useCallback((e: React.PointerEvent) => {
    // Pan on middle button or when clicking empty background
    const isMiddle = e.button === 1;
    const isBackground = e.target === svgRef.current
      || (e.target as Element).classList.contains('stage-bg')
      || (e.target as Element).getAttribute('fill') === 'url(#lab-grid)';

    if (isMiddle || (isBackground && e.button === 0 && activeTool === 'select' && !pending)) {
      e.preventDefault();
      isPanning.current = true;
      panDrag.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
      svgRef.current?.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const drag = panDrag.current;
        if (!drag) return;
        const dx = (ev.clientX - drag.startX) * (STAGE_W / (svgRef.current?.getBoundingClientRect().width ?? 1));
        const dy = (ev.clientY - drag.startY) * (STAGE_H / (svgRef.current?.getBoundingClientRect().height ?? 1));
        setPan({ x: drag.panX + dx, y: drag.panY + dy });
      };
      const onUp = () => {
        isPanning.current = false;
        panDrag.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
    }
  }, [activeTool, pending, pan.x, pan.y]);

  // ---- node dragging ----
  const handleNodePointerDown = (event: React.PointerEvent, id: string) => {
    if (circuit.activeTool === 'wire') return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const comp = components.find((c) => c.id === id);
    const pt = svgPoint(event.clientX, event.clientY);
    if (!comp || !pt) return;
    event.preventDefault();
    event.stopPropagation();
    circuit.setSelected({ kind: 'comp', id });
    nodeDrag.current = { id, dx: pt.x - comp.x, dy: pt.y - comp.y };
    setDragTick((n) => n + 1);

    const onMove = (ev: PointerEvent) => {
      const cur = nodeDrag.current;
      if (!cur) return;
      const p = svgPoint(ev.clientX, ev.clientY);
      if (p) circuit.moveComponent(cur.id, p.x - cur.dx, p.y - cur.dy);
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointercancel', onUp);
      const cur = nodeDrag.current;
      if (cur) {
        const p = svgPoint(ev.clientX, ev.clientY);
        if (p) circuit.dropComponent(cur.id, p.x - cur.dx, p.y - cur.dy);
      }
      nodeDrag.current = null;
      setDragTick((n) => n + 1);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    window.addEventListener('pointercancel', onUp, { once: true });
  };

  // ---- palette place-drag ----
  const handlePlaceStart = (event: React.PointerEvent, type: ComponentType) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    placeDrag.current = { type, startX: event.clientX, startY: event.clientY, overStage: null };
    const onMove = (ev: PointerEvent) => {
      const drag = placeDrag.current;
      if (!drag) return;
      const moved = Math.hypot(ev.clientX - drag.startX, ev.clientY - drag.startY);
      const svg = svgRef.current;
      const rect = svg?.getBoundingClientRect();
      const inside = !!rect && ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom;
      drag.overStage = inside && svg ? svgPoint(ev.clientX, ev.clientY) : null;
      setGhost(moved > DRAG_THRESHOLD_PX ? { type: drag.type, clientX: ev.clientX, clientY: ev.clientY } : null);
    };
    const onUp = (ev: PointerEvent) => {
      const drag = placeDrag.current;
      placeDrag.current = null;
      setGhost(null);
      if (!drag) return;
      const moved = Math.hypot(ev.clientX - drag.startX, ev.clientY - drag.startY) > DRAG_THRESHOLD_PX;
      if (moved && drag.overStage) {
        circuit.addComponent(drag.type, clampPosition(drag.type, drag.overStage.x, drag.overStage.y));
      } else if (!moved) {
        lastPointerPlace.current = Date.now();
        circuit.addComponent(drag.type);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    window.addEventListener('pointercancel', onUp, { once: true });
  };

  const handlePlaceAtFree = (type: ComponentType) => {
    if (Date.now() - lastPointerPlace.current < 500) return;
    circuit.addComponent(type);
  };

  // ---- keyboard ----
  const handleNodeKeyDown = (event: React.KeyboardEvent, id: string) => {
    const comp = components.find((c) => c.id === id);
    if (!comp) return;
    const step = event.shiftKey ? 1 : GRID;
    let dx = 0, dy = 0;
    if (event.key === 'ArrowLeft') dx = -step;
    else if (event.key === 'ArrowRight') dx = step;
    else if (event.key === 'ArrowUp') dy = -step;
    else if (event.key === 'ArrowDown') dy = step;
    else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      circuit.setSelected({ kind: 'comp', id });
      circuit.removeSelected();
      return;
    } else return;
    event.preventDefault();
    circuit.dropComponent(id, comp.x + dx, comp.y + dy);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inField = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (event.key === 'Escape') {
        if (circuit.pending) circuit.cancelPending();
        else if (circuit.activeTool === 'wire') circuit.setActiveTool('select');
        else circuit.setSelected(null);
        return;
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && !inField) {
        if (circuit.selected?.kind === 'wire') {
          event.preventDefault();
          circuit.removeSelected();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, activeTool, pending]);

  const selectedComp = selected?.kind === 'comp' ? components.find((c) => c.id === selected.id) ?? null : null;
  const selectedWireIndex = selected?.kind === 'wire' ? wires.findIndex((w) => w.id === selected.id) : -1;

  const handleTerminalActivate = (endpoint: WireEndpoint) => {
    if (activeTool !== 'wire') circuit.setActiveTool('wire');
    circuit.activateTerminal(endpoint);
  };

  // Reset zoom/pan on reset signal
  const prevCompCount = useRef(components.length);
  useEffect(() => {
    if (prevCompCount.current > 0 && components.length === 0) {
      zoomRef.current = 1;
      panRef.current = { x: 0, y: 0 };
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
    prevCompCount.current = components.length;
  }, [components.length]);

  // Transform string for the content group
  const transform = `translate(${pan.x} ${pan.y}) scale(${zoom})`;

  return (
    <div className="circuit-wrap">
      <ComponentPalette
        onPlaceStart={handlePlaceStart}
        onPlaceAtFree={handlePlaceAtFree}
      />
      <div className="stage-svg-wrap">
        {/* Zoom controls */}
        <div className="zoom-controls">
          <button type="button" className="zoom-btn" onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z * 1.2))} title="Phóng to">+</button>
          <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          <button type="button" className="zoom-btn" onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z / 1.2))} title="Thu nhỏ">−</button>
          <button type="button" className="zoom-btn" onClick={() => { zoomRef.current = 1; panRef.current = { x: 0, y: 0 }; setZoom(1); setPan({ x: 0, y: 0 }); }} title="Đặt lại">⟲</button>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
          className={`stage-svg${isPanning.current ? ' stage-svg--panning' : ''}`}
          role="application"
          aria-label="Mạch điện đang lắp."
          onPointerDown={handleSvgPointerDown}
        >
          <defs>
            <pattern id="lab-grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
              <circle cx={GRID / 2} cy={GRID / 2} r={1.2} fill="var(--color-border)" opacity="0.45" />
            </pattern>
          </defs>
          <rect x={0} y={0} width={STAGE_W} height={STAGE_H} className="stage-bg" />
          <rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#lab-grid)" />

          {/* Zoomable/pannable content group */}
          <g transform={transform} className="stage-content">
            <WireLayer
              wires={wires}
              components={components}
              selectedWireId={selected?.kind === 'wire' ? selected.id : null}
              onWireSelect={(id) => circuit.setSelected({ kind: 'wire', id })}
              isRunning={circuit.isRunning}
            />
            {components.map((comp) => (
              <ComponentNode
                key={comp.id}
                comp={comp}
                selected={selected?.kind === 'comp' && selected.id === comp.id}
                wireMode={activeTool === 'wire'}
                pendingTerminals={pending ? [pending] : []}
                onNodePointerDown={handleNodePointerDown}
                onNodeSelect={(id) => circuit.setSelected({ kind: 'comp', id })}
                switchClosed={comp.type === 'switch' ? circuit.switchOn : undefined}
                isRunning={circuit.isRunning}
                liveReading={circuit.isRunning ? liveReading : null}
                instrumentValue={comp.type === 'voltmeter' ? manualU : comp.type === 'ammeter' ? manualI : undefined}
                onInstrumentEdit={onInstrumentEdit ? (id, value) => {
                  const c = components.find((c) => c.id === id);
                  if (c) onInstrumentEdit(c.type === 'voltmeter' ? 'U' : 'I', value);
                } : undefined}
                onNodeKeyDown={handleNodeKeyDown}
                onTerminalActivate={handleTerminalActivate}
                onSwitchToggle={() => circuit.setSwitchOn(!circuit.switchOn)}
              />
            ))}
            {components.length === 0 && (
              <text x={STAGE_W / 2} y={STAGE_H / 2} textAnchor="middle" className="stage-hint">
                Thêm dụng cụ từ hộp bên trái
              </text>
            )}
          </g>
        </svg>

        {activeTool === 'wire' && (
          <p className="stage-chip" role="status">
            {pending
              ? 'Đã chọn 1 chốt — chọn chốt thứ 2 để nối (Esc hủy)'
              : 'Chế độ nối dây — chọn 2 chốt để nối (Esc thoát)'}
          </p>
        )}

        {(selectedComp || selectedWireIndex >= 0) && (
          <div className="selection-bar">
            <span>
              Đã chọn:{' '}
              {selectedComp
                ? COMPONENT_DEFS[selectedComp.type].label
                : `Dây nối ${selectedWireIndex + 1}`}
            </span>
            <button type="button" onClick={circuit.removeSelected}>
              Xóa (Del)
            </button>
          </div>
        )}
      </div>

      {ghost && (
        <div
          className="drag-ghost"
          style={{ left: ghost.clientX + 12, top: ghost.clientY + 12 }}
          aria-hidden="true"
        >
          {COMPONENT_DEFS[ghost.type].label}
        </div>
      )}
    </div>
  );
}
