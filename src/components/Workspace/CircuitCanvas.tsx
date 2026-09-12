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
import type { PlacedComponent } from '../../lib/circuitModel.ts';
import ComponentNode from './ComponentNode.tsx';
import ComponentPalette from './ComponentPalette.tsx';
import WireLayer from './WireLayer.tsx';
import './CircuitCanvas.css';

const DRAG_THRESHOLD_PX = 6;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;

type Ghost = { type: ComponentType; clientX: number; clientY: number };

function InlineToolbar({ comp, circuit }: {
  comp: PlacedComponent;
  circuit: CircuitApi;
}) {
  const def = COMPONENT_DEFS[comp.type];
  const btnSize = 26;
  const gap = 4;
  const barW = btnSize * 2 + gap + 8;
  const barH = btnSize + 6;
  const x = comp.x - barW / 2;
  const y = comp.y - def.h / 2 - barH - 8;

  return (
    <g className="inline-toolbar" transform={`translate(${x} ${y})`}>
      <rect width={barW} height={barH} rx={6} fill="var(--color-panel)" stroke="var(--color-border)" strokeWidth={1} />
      {/* Flip button */}
      <g transform={`translate(4 3)`} className="inline-toolbar-btn" onClick={() => circuit.flipComponent(comp.id)}>
        <rect width={btnSize} height={btnSize} rx={4} fill="var(--color-bg)" stroke="var(--color-border)" strokeWidth={1} />
        <text x={btnSize / 2} y={btnSize / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700} fill="var(--color-text)" style={{ pointerEvents: 'none' }}>⇄</text>
      </g>
      {/* Delete button */}
      <g transform={`translate(${4 + btnSize + gap} 3)`} className="inline-toolbar-btn inline-toolbar-btn--delete" onClick={() => { circuit.setSelected({ kind: 'comp', id: comp.id }); circuit.removeSelected(); }}>
        <rect width={btnSize} height={btnSize} rx={4} fill="#ef4444" stroke="#dc2626" strokeWidth={1} />
        <text x={btnSize / 2} y={btnSize / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700} fill="white" style={{ pointerEvents: 'none' }}>×</text>
      </g>
    </g>
  );
}

function BottomBar({ comp, circuit, liveReading, manualU, manualI, onInstrumentEdit }: {
  comp: PlacedComponent;
  circuit: CircuitApi;
  liveReading?: { U: number; I: number } | null;
  manualU?: number;
  manualI?: number;
  onInstrumentEdit?: (type: 'U' | 'I', value: number) => void;
}) {
  const def = COMPONENT_DEFS[comp.type];
  const isInstrument = comp.type === 'voltmeter' || comp.type === 'ammeter';
  const unit = comp.type === 'voltmeter' ? 'V' : 'A';
  const value = comp.type === 'voltmeter' ? manualU : manualI;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const commitEdit = () => {
    setEditing(false);
    const num = parseFloat(draft);
    if (!isNaN(num) && num >= 0 && onInstrumentEdit) {
      onInstrumentEdit(comp.type === 'voltmeter' ? 'U' : 'I', num);
    }
  };

  return (
    <div className="bottom-bar-wrap">
      <div className="bottom-bar">
        <span className="bottom-bar-label">Đã chọn: {def.label}</span>
        {isInstrument && !circuit.isRunning && (
          <span className="bottom-bar-value" onClick={() => { setDraft(String(value ?? 0)); setEditing(true); }}>
            {(value ?? 0).toFixed(2)} {unit} ✎
          </span>
        )}
        {isInstrument && circuit.isRunning && (
          <span className="bottom-bar-value bottom-bar-value--live">
            {(comp.type === 'voltmeter' ? liveReading?.U : liveReading?.I)?.toFixed(2) ?? '0.00'} {unit}
          </span>
        )}
      </div>
      {editing && isInstrument && (
        <div className="bottom-bar-edit">
          <input type="number" min={0} step="any" value={draft} autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false); }}
          />
          <span className="bottom-bar-edit-unit">{unit}</span>
          <button type="button" className="bottom-bar-edit-ok" onClick={commitEdit}>✓</button>
        </div>
      )}
    </div>
  );
}

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
  const wrapRef = useRef<HTMLDivElement>(null);
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
      // Smooth zoom: smaller increments, scaled by deltaY magnitude
      const rawFactor = -e.deltaY * 0.005;
      const factor = 1 + Math.max(-0.15, Math.min(0.15, rawFactor));
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

  const handleBackgroundClick = useCallback(() => {
    if (circuit.activeTool === 'wire') {
      circuit.cancelPending();
      circuit.setActiveTool('select');
    }
    circuit.setSelected(null);
  }, [circuit]);

  // ---- middle-click / alt+drag pan ----
  const handleSvgPointerDown = useCallback((e: React.PointerEvent) => {
    // Pan on middle button or when clicking empty background
    const isMiddle = e.button === 1;
    const isBackground = e.target === svgRef.current
      || (e.target as Element).classList.contains('stage-bg')
      || (e.target as Element).getAttribute('fill') === 'url(#lab-grid)';

    if (isBackground) {
      // Always deselect + cancel wire on background click
      handleBackgroundClick();

      if (isMiddle || (e.button === 0 && activeTool === 'select' && !pending)) {
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
    }
  }, [activeTool, pending, pan.x, pan.y, handleBackgroundClick]);

  // ---- node dragging ----
  const handleNodePointerDown = (event: React.PointerEvent, id: string) => {
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
    else return;
    event.preventDefault();
    circuit.dropComponent(id, comp.x + dx, comp.y + dy);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (circuit.pending) circuit.cancelPending();
        else if (circuit.activeTool === 'wire') circuit.setActiveTool('select');
        else circuit.setSelected(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, activeTool, pending]);

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
      <div className="stage-svg-wrap" ref={wrapRef}>
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
          <rect x={0} y={0} width={STAGE_W} height={STAGE_H} className="stage-bg" onClick={handleBackgroundClick} />

          {/* Zoomable/pannable content group */}
          <g transform={transform} className="stage-content">
            <rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#lab-grid)" onClick={handleBackgroundClick} />
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
                onNodeKeyDown={handleNodeKeyDown}
                onTerminalActivate={handleTerminalActivate}
              />
            ))}
            {components.length === 0 && (
              <text x={STAGE_W / 2} y={STAGE_H / 2} textAnchor="middle" className="stage-hint">
                Thêm dụng cụ từ hộp bên trái
              </text>
            )}
            {selected?.kind === 'comp' && (() => {
              const comp = components.find((c) => c.id === selected.id);
              if (!comp) return null;
              return <InlineToolbar comp={comp} circuit={circuit} />;
            })()}
          </g>

          {/* Fixed title — does not pan/zoom */}
          <text x={STAGE_W / 2} y={30} textAnchor="middle" className="stage-title">
            Khu vực mô phỏng
          </text>
        </svg>

        {activeTool === 'wire' && (
          <p className="stage-chip" role="status">
            {pending
              ? 'Đã chọn 1 chốt — chọn chốt thứ 2 để nối (Esc hủy)'
              : 'Chế độ nối dây — chọn 2 chốt để nối (nhấn ngoài để thoát)'}
          </p>
        )}

        {selected?.kind === 'comp' && (() => {
          const comp = components.find((c) => c.id === selected.id);
          if (!comp) return null;
          return (
            <BottomBar
              comp={comp}
              circuit={circuit}
              liveReading={liveReading}
              manualU={manualU}
              manualI={manualI}
              onInstrumentEdit={onInstrumentEdit}
            />
          );
        })()}
      </div>

      {ghost && (
        <div
          className="drag-ghost"
          style={{ left: ghost.clientX + 12, top: ghost.clientY + 12 }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 48 32" width={40} height={28}>
            <line x1={4} y1={16} x2={44} y2={16} stroke="#475569" strokeWidth={2} strokeLinecap="round" />
            <text x={24} y={20} textAnchor="middle" fontSize={12} fontWeight={700} fill="#475569">
              {ghost.type === 'supply' ? '⚡' : ghost.type === 'resistor' ? 'R' : ghost.type === 'ammeter' ? 'A' : ghost.type === 'voltmeter' ? 'V' : '⏻'}
            </text>
          </svg>
          <span className="drag-ghost-label">{COMPONENT_DEFS[ghost.type].label}</span>
        </div>
      )}
    </div>
  );
}
