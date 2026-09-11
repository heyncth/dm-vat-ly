import {
  terminalPosition,
  type PlacedComponent,
  type Wire,
} from '../../lib/circuitModel.ts';

type WireLayerProps = {
  wires: Wire[];
  components: PlacedComponent[];
  selectedWireId: string | null;
  onWireSelect: (id: string) => void;
  isRunning?: boolean;
};

function Particles({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 30) return null;

  const count = Math.min(6, Math.max(2, Math.floor(len / 60)));

  return (
    <g className="particles">
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          r={2.5}
          className="particle"
          style={{
            offsetDistance: `${(i / count) * 100}%`,
          }}
        >
          <animateMotion
            dur="1.8s"
            repeatCount="indefinite"
            begin={`${(i / count) * 1.8}s`}
          >
            <mpath href={`#wire-path-${x1}-${y1}-${x2}-${y2}`} />
          </animateMotion>
        </circle>
      ))}
    </g>
  );
}

export default function WireLayer({
  wires,
  components,
  selectedWireId,
  onWireSelect,
  isRunning,
}: WireLayerProps) {
  const byId = new Map(components.map((c) => [c.id, c]));

  return (
    <g className="wire-layer">
      {/* Hidden path definitions for particle animation */}
      <defs>
        {wires.map((wire) => {
          const fromComp = byId.get(wire.from.compId);
          const toComp = byId.get(wire.to.compId);
          if (!fromComp || !toComp) return null;
          const p1 = terminalPosition(fromComp, wire.from.end);
          const p2 = terminalPosition(toComp, wire.to.end);
          return (
            <path
              key={`path-${wire.id}`}
              id={`wire-path-${p1.x}-${p1.y}-${p2.x}-${p2.y}`}
              d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
              fill="none"
            />
          );
        })}
      </defs>

      {wires.map((wire, index) => {
        const fromComp = byId.get(wire.from.compId);
        const toComp = byId.get(wire.to.compId);
        if (!fromComp || !toComp) {
          return null;
        }
        const p1 = terminalPosition(fromComp, wire.from.end);
        const p2 = terminalPosition(toComp, wire.to.end);
        const selected = wire.id === selectedWireId;
        return (
          <g key={wire.id}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="wire-hit"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                onWireSelect(wire.id);
              }}
            >
              <title>{`Dây nối ${index + 1}`}</title>
            </line>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className={`wire${selected ? ' wire--selected' : ''}${isRunning ? ' wire--active' : ''}`}
            />
            {isRunning && (
              <Particles x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />
            )}
          </g>
        );
      })}
    </g>
  );
}
