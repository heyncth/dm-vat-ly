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
  const plusX = flipped ? 8 : -8;
  const minusX = flipped ? -8 : 8;
  return (
    <g className="node-shape">
      {/* leads */}
      <line x1={-w / 2} y1={0} x2={-6} y2={0} className="node-lead" />
      <line x1={6} y1={0} x2={w / 2} y2={0} className="node-lead" />
      <g transform={`scale(${sx},1)`}>
        {/* long thin plate (+) */}
        <line x1={-6} y1={-18} x2={-6} y2={18} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
        {/* short thick plate (−) */}
        <line x1={6} y1={-10} x2={6} y2={10} stroke="#475569" strokeWidth={7} strokeLinecap="round" />
      </g>
      {/* polarity signs */}
      <text x={plusX} y={-h / 2 - 2} textAnchor="middle" className="node-sign node-sign--plus">+</text>
      <text x={minusX} y={-h / 2 - 2} textAnchor="middle" className="node-sign node-sign--minus">−</text>
      <text x={0} y={h / 2 + 14} textAnchor="middle" className="node-caption">Nguồn</text>
    </g>
  );
}

function ResistorShape({ w, h, isRunning, liveReading, flipped }: { w: number; h: number; isRunning?: boolean; liveReading?: { U: number; I: number } | null; flipped?: boolean }) {
  const rValue = isRunning && liveReading && liveReading.I > 0 ? liveReading.U / liveReading.I : null;
  const sx = flipped ? -1 : 1;
  const bodyW = 48;
  const bodyH = 20;
  return (
    <g className="node-shape">
      <g transform={`scale(${sx},1)`}>
        {/* leads */}
        <line x1={-w / 2} y1={0} x2={-bodyW / 2} y2={0} className="node-lead" />
        <line x1={bodyW / 2} y1={0} x2={w / 2} y2={0} className="node-lead" />
        {/* IEC rectangle body */}
        <rect x={-bodyW / 2} y={-bodyH / 2} width={bodyW} height={bodyH} rx={3}
          fill="url(#resist-grad)" stroke="#475569" strokeWidth={2} />
        {/* color bands */}
        <rect x={-bodyW / 2 + 8} y={-bodyH / 2} width={4} height={bodyH} fill="#a16207" rx={1} />
        <rect x={-bodyW / 2 + 16} y={-bodyH / 2} width={4} height={bodyH} fill="#a16207" rx={1} />
        <rect x={-bodyW / 2 + 24} y={-bodyH / 2} width={4} height={bodyH} fill="#b45309" rx={1} />
        <rect x={bodyW / 2 - 10} y={-bodyH / 2} width={4} height={bodyH} fill="#d4af37" rx={1} />
      </g>
      <text x={0} y={h / 2 + 12} textAnchor="middle" className="node-caption">Điện trở</text>
      {rValue !== null && (
        <g className="r-badge">
          <rect x={-38} y={-bodyH / 2 - 26} width={76} height={20} rx={4} fill="#fef08a" stroke="#eab308" strokeWidth={1.5} />
          <text x={0} y={-bodyH / 2 - 12} textAnchor="middle" style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', fill: '#854d0e' }}>
            R = {rValue.toFixed(2)} Ω
          </text>
        </g>
      )}
    </g>
  );
}

function InstrumentShape({ comp, w, isRunning, liveReading, instrumentValue, flipped }: {
  comp: PlacedComponent;
  w: number;
  isRunning?: boolean;
  liveReading?: { U: number; I: number } | null;
  instrumentValue?: number;
  flipped?: boolean;
}) {
  const r = w / 2 - 4;
  const unit = comp.type === 'ammeter' ? 'A' : 'V';
  const rawValue = instrumentValue ?? 0;
  const displayValue = isRunning && liveReading
    ? (comp.type === 'ammeter' ? liveReading.I : liveReading.U)
    : rawValue;
  const accentColor = comp.type === 'ammeter' ? '#0ea5e9' : '#8b5cf6';

  return (
    <g className="node-shape">
      <defs>
        <linearGradient id={`gauge-grad-${comp.type}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      {/* outer ring */}
      <circle r={r + 3} fill="none" stroke={accentColor} strokeWidth={2.5} opacity={0.4} />
      {/* body */}
      <circle r={r} fill={`url(#gauge-grad-${comp.type})`} stroke="#475569" strokeWidth={2} />
      {/* LCD display */}
      <rect x={-r + 6} y={-10} width={(r - 6) * 2} height={20} rx={3}
        fill={isRunning ? '#dcfce7' : '#f1f5f9'} stroke="#94a3b8" strokeWidth={1} />
      <text x={0} y={4} textAnchor="middle" style={{
        fontSize: '12px', fontWeight: 700, fontFamily: 'monospace',
        fill: isRunning ? '#166534' : '#475569', userSelect: 'none',
      }}>
        {displayValue.toFixed(comp.type === 'ammeter' ? 3 : 2)} {unit}
      </text>
      {/* polarity signs */}
      <text x={flipped ? w / 2 + 6 : -w / 2 - 6} y={-r - 2} textAnchor="middle" className="node-sign node-sign--plus">+</text>
      <text x={flipped ? -w / 2 - 6 : w / 2 + 6} y={-r - 2} textAnchor="middle" className="node-sign node-sign--minus">−</text>
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
        {/* invisible hit area */}
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
      {/* Invisible hit area for the whole component */}
      <rect x={-def.w / 2 - haloPad} y={-def.h / 2 - haloPad}
        width={def.w + haloPad * 2} height={def.h + haloPad * 2} fill="transparent" />
      {selected && (
        <rect x={-def.w / 2 - haloPad} y={-def.h / 2 - haloPad}
          width={def.w + haloPad * 2} height={def.h + haloPad * 2} rx={12} className="node-halo" />
      )}
      {comp.type === 'supply' && <SupplyShape w={def.w} h={def.h} flipped={comp.flipped} />}
      {comp.type === 'resistor' && <ResistorShape w={def.w} h={def.h} isRunning={isRunning} liveReading={liveReading} flipped={comp.flipped} />}
      {(comp.type === 'ammeter' || comp.type === 'voltmeter') && (
        <InstrumentShape comp={comp} w={def.w} isRunning={isRunning} liveReading={liveReading}
          instrumentValue={instrumentValue} flipped={comp.flipped} />
      )}
      {comp.type === 'switch' && (
        <SwitchShape w={def.w} h={def.h} closed={switchClosed === true} flipped={comp.flipped} />
      )}
      {ENDS.map((end) => {
        const pos = terminalPosition({ ...comp, x: 0, y: 0 }, end);
        const isPending = pendingTerminals.some((t) => t.compId === comp.id && t.end === end);
        const label = `${def.label}, chốt ${end === 'a' ? 'trái' : 'phải'}`;
        return (
          <g key={end}>
            {/* glow ring on hover */}
            {wireMode && (
              <circle cx={pos.x} cy={pos.y} r={12} fill="none" stroke="var(--color-primary)"
                strokeWidth={1.5} opacity={0.3} className="terminal-glow" />
            )}
            <circle cx={pos.x} cy={pos.y} r={wireMode ? 8 : 5} tabIndex={0}
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
          </g>
        );
      })}
    </g>
  );
}
