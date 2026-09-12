import {
  COMPONENT_DEFS,
  terminalPosition,
  type PlacedComponent,
  type TerminalEnd,
  type WireEndpoint,
} from '../../lib/circuitModel.ts';

type ComponentNodeProps = {
  comp: PlacedComponent;
  selected: boolean;
  wireMode: boolean;
  pendingTerminals: WireEndpoint[];
  switchClosed?: boolean;
  isRunning?: boolean;
  liveReading?: { U: number; I: number } | null;
  instrumentValue?: number;
  onNodePointerDown: (event: React.PointerEvent, id: string) => void;
  onNodeSelect: (id: string) => void;
  onNodeKeyDown: (event: React.KeyboardEvent, id: string) => void;
  onTerminalActivate: (endpoint: WireEndpoint) => void;
};

function SupplyShape({ w, h, flipped }: { w: number; h: number; flipped?: boolean }) {
  const sx = flipped ? -1 : 1;
  // When flipped: + visually on right (terminal b), − on left (terminal a)
  const plusX = flipped ? 12 : -12;
  const minusX = flipped ? -12 : 12;
  return (
    <g className="node-shape">
      <g transform={`scale(${sx},1)`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} className="node-body" />
        <line x1={-12} y1={-14} x2={-12} y2={14} className="node-plate node-plate--long" />
        <line x1={12} y1={-7} x2={12} y2={7} className="node-plate node-plate--short" />
      </g>
      <text x={plusX} y={-h / 2 - 6} textAnchor="middle" className="node-sign">+</text>
      <text x={minusX} y={-h / 2 - 6} textAnchor="middle" className="node-sign">−</text>
      <text x={0} y={h / 2 + 16} textAnchor="middle" className="node-caption">Nguồn</text>
    </g>
  );
}

function ResistorShape({ w, h, isRunning, liveReading, flipped }: { w: number; h: number; isRunning?: boolean; liveReading?: { U: number; I: number } | null; flipped?: boolean }) {
  const rValue = isRunning && liveReading && liveReading.I > 0 ? liveReading.U / liveReading.I : null;
  const sx = flipped ? -1 : 1;
  return (
    <g className="node-shape">
      <g transform={`scale(${sx},1)`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} className="node-body" />
        <polyline points="-24,0 -16,-10 -8,10 0,-10 8,10 16,-10 24,0" className="node-zigzag" />
      </g>
      <text x={0} y={h / 2 + 16} textAnchor="middle" className="node-caption">R</text>
      {rValue !== null && (
        <g className="r-badge">
          <rect x={-36} y={-h / 2 - 28} width={72} height={22} rx={4} fill="#fef08a" stroke="#eab308" strokeWidth={1.5} />
          <text x={0} y={-h / 2 - 13} textAnchor="middle" style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', fill: '#854d0e' }}>
            R = {rValue.toFixed(2)} Ω
          </text>
        </g>
      )}
    </g>
  );
}

function InstrumentShape({ comp, w, isRunning, liveReading, instrumentValue }: {
  comp: PlacedComponent;
  w: number;
  isRunning?: boolean;
  liveReading?: { U: number; I: number } | null;
  instrumentValue?: number;
}) {
  const r = w / 2 - 4;
  const unit = comp.type === 'ammeter' ? 'A' : 'V';
  const rawValue = instrumentValue ?? 0;
  const displayValue = isRunning && liveReading
    ? (comp.type === 'ammeter' ? liveReading.I : liveReading.U)
    : rawValue;

  return (
    <g className="node-shape">
      <circle r={r} className="node-body" />
      <rect x={-r + 4} y={-12} width={(r - 4) * 2} height={24} rx={3}
        fill={isRunning ? '#dcfce7' : '#f1f5f9'} stroke="var(--color-border)" strokeWidth={1} />
      <text x={0} y={4} textAnchor="middle" style={{
        fontSize: '11px', fontWeight: 600, fontFamily: 'monospace',
        fill: isRunning ? '#166534' : '#475569', userSelect: 'none',
      }}>
        {displayValue.toFixed(2)} {unit}
      </text>
      <text y={r + 14} textAnchor="middle" className="node-caption">
        {comp.type === 'ammeter' ? 'Ampe kế' : 'Vôn kế'}
      </text>
    </g>
  );
}

function SwitchShape({ w, h, closed, flipped }: { w: number; h: number; closed: boolean; flipped?: boolean }) {
  const sx = flipped ? -1 : 1;
  return (
    <g className="node-shape">
      <g transform={`scale(${sx},1)`}>
        <line x1={-w / 2} y1={0} x2={-w / 2 + 14} y2={0} className="node-lead" />
        <line x1={w / 2 - 14} y1={0} x2={w / 2} y2={0} className="node-lead" />
        {closed ? (
          <line x1={-w / 2 + 14} y1={0} x2={w / 2 - 14} y2={0} className="node-lever" />
        ) : (
          <line x1={-w / 2 + 14} y1={0} x2={w / 2 - 18} y2={-20} className="node-lever" />
        )}
        <circle cx={-w / 2 + 14} cy={0} r={4} className="node-pivot" />
        <circle cx={closed ? w / 2 - 14 : w / 2 - 18} cy={closed ? 0 : -20} r={4}
          className={`node-pivot${closed ? '' : ' node-pivot--open'}`} />
        {/* Invisible hit area — large for easy clicking */}
        <line x1={-w / 2 + 14} y1={closed ? 0 : 10} x2={closed ? w / 2 - 14 : w / 2 - 18} y2={closed ? 0 : -10}
          stroke="transparent" strokeWidth={36} strokeLinecap="round" className="switch-hit" />
      </g>
      <text x={0} y={h / 2 + 16} textAnchor="middle" className="node-caption">Công tắc</text>
    </g>
  );
}

const ENDS: TerminalEnd[] = ['a', 'b'];

export default function ComponentNode({
  comp, selected, wireMode, pendingTerminals, switchClosed, isRunning,
  liveReading, instrumentValue, onNodePointerDown, onNodeSelect,
  onNodeKeyDown, onTerminalActivate,
}: ComponentNodeProps) {
  const def = COMPONENT_DEFS[comp.type];
  const haloPad = 10;

  return (
    <g
      transform={`translate(${comp.x} ${comp.y})`}
      role="button"
      tabIndex={0}
      aria-label={`Linh kiện ${def.label}. Phím mũi tên để di chuyển.`}
      className={`node${selected ? ' node--selected' : ''}`}
      onPointerDown={(event) => onNodePointerDown(event, comp.id)}
      onClick={(event) => { event.stopPropagation(); onNodeSelect(comp.id); }}
      onKeyDown={(event) => onNodeKeyDown(event, comp.id)}
    >
      <title>{def.label}</title>
      {selected && (
        <rect x={-def.w / 2 - haloPad} y={-def.h / 2 - haloPad}
          width={def.w + haloPad * 2} height={def.h + haloPad * 2} rx={12} className="node-halo" />
      )}
      {comp.type === 'supply' && <SupplyShape w={def.w} h={def.h} flipped={comp.flipped} />}
      {comp.type === 'resistor' && <ResistorShape w={def.w} h={def.h} isRunning={isRunning} liveReading={liveReading} flipped={comp.flipped} />}
      {(comp.type === 'ammeter' || comp.type === 'voltmeter') && (
        <InstrumentShape comp={comp} w={def.w} isRunning={isRunning} liveReading={liveReading}
          instrumentValue={instrumentValue} />
      )}
      {comp.type === 'switch' && (
        <SwitchShape w={def.w} h={def.h} closed={switchClosed === true} flipped={comp.flipped} />
      )}
      {ENDS.map((end) => {
        const pos = terminalPosition({ ...comp, x: 0, y: 0 }, end);
        const isPending = pendingTerminals.some((t) => t.compId === comp.id && t.end === end);
        const label = `${def.label}, chốt ${end === 'a' ? 'trái' : 'phải'}`;
        return (
          <circle key={end} cx={pos.x} cy={pos.y} r={wireMode ? 9 : 5} tabIndex={0}
            role="button" aria-label={label}
            className={`terminal${wireMode ? ' terminal--active' : ''}${isPending ? ' terminal--pending' : ''}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => { event.stopPropagation(); onTerminalActivate({ compId: comp.id, end }); }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault(); event.stopPropagation();
                onTerminalActivate({ compId: comp.id, end });
              }
            }}
          />
        );
      })}
    </g>
  );
}
