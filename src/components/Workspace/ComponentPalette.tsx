import { COMPONENT_DEFS, type ComponentType } from '../../lib/circuitModel.ts';

type ComponentPaletteProps = {
  /** Pointer-drag from palette onto the stage (mouse/touch). */
  onPlaceStart: (event: React.PointerEvent, type: ComponentType) => void;
  /** Keyboard activation: place at a free spot. */
  onPlaceAtFree: (type: ComponentType) => void;
};

const CATEGORIES = [
  { label: 'Nguồn & Điều khiển', types: ['supply' as ComponentType, 'switch' as ComponentType] },
  { label: 'Đo lường', types: ['ammeter' as ComponentType, 'voltmeter' as ComponentType] },
  { label: 'Điện trở', types: ['resistor' as ComponentType] },
];

const ENGLISH_NAMES: Record<ComponentType, string> = {
  supply: 'DC Source',
  resistor: 'Resistor',
  ammeter: 'Ammeter',
  voltmeter: 'Voltmeter',
  switch: 'Switch',
};

function PaletteIcon({ type }: { type: ComponentType }) {
  const color = '#475569';
  switch (type) {
    case 'supply':
      return (
        <svg viewBox="0 0 48 32" className="palette-svg">
          <line x1={4} y1={16} x2={14} y2={16} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <line x1={34} y1={16} x2={44} y2={16} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <line x1={16} y1={6} x2={16} y2={26} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={22} y1={10} x2={22} y2={22} stroke={color} strokeWidth={4.5} strokeLinecap="round" />
          <line x1={28} y1={6} x2={28} y2={26} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <text x={16} y={4} textAnchor="middle" fontSize={8} fontWeight={700} fill="#dc2626">+</text>
          <text x={32} y={4} textAnchor="middle" fontSize={8} fontWeight={700} fill={color}>−</text>
        </svg>
      );
    case 'resistor':
      return (
        <svg viewBox="0 0 48 24" className="palette-svg">
          <line x1={2} y1={12} x2={10} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <line x1={38} y1={12} x2={46} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <rect x={10} y={4} width={28} height={16} rx={2} fill="#e2e8f0" stroke={color} strokeWidth={2} />
          <rect x={14} y={4} width={3} height={16} fill="#a16207" />
          <rect x={20} y={4} width={3} height={16} fill="#a16207" />
          <rect x={26} y={4} width={3} height={16} fill="#b45309" />
          <rect x={33} y={4} width={3} height={16} fill="#d4af37" />
        </svg>
      );
    case 'ammeter':
      return (
        <svg viewBox="0 0 32 32" className="palette-svg">
          <circle cx={16} cy={16} r={13} fill="#f0f9ff" stroke={color} strokeWidth={2} />
          <circle cx={16} cy={16} r={15} fill="none" stroke="#0ea5e9" strokeWidth={1.5} opacity={0.4} />
          <text x={16} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0ea5e9">A</text>
        </svg>
      );
    case 'voltmeter':
      return (
        <svg viewBox="0 0 32 32" className="palette-svg">
          <circle cx={16} cy={16} r={13} fill="#f5f3ff" stroke={color} strokeWidth={2} />
          <circle cx={16} cy={16} r={15} fill="none" stroke="#8b5cf6" strokeWidth={1.5} opacity={0.4} />
          <text x={16} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill="#8b5cf6">V</text>
        </svg>
      );
    case 'switch':
      return (
        <svg viewBox="0 0 48 28" className="palette-svg">
          <line x1={4} y1={16} x2={14} y2={16} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <line x1={34} y1={16} x2={44} y2={16} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <circle cx={14} cy={16} r={3} fill={color} />
          <circle cx={34} cy={10} r={3} fill="#f8fafc" stroke={color} strokeWidth={1.5} />
          <line x1={14} y1={16} x2={34} y2={10} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        </svg>
      );
  }
}

export default function ComponentPalette({
  onPlaceStart,
  onPlaceAtFree,
}: ComponentPaletteProps) {
  return (
    <div className="palette" role="toolbar" aria-label="Hộp dụng cụ">
      {CATEGORIES.map((cat) => (
        <div key={cat.label} className="palette-category">
          <div className="palette-category-label">{cat.label}</div>
          {cat.types.map((type) => (
            <button
              key={type}
              type="button"
              className="palette-item"
              title={`${COMPONENT_DEFS[type].label} (${ENGLISH_NAMES[type]})`}
              onPointerDown={(event) => onPlaceStart(event, type)}
              onClick={(event) => {
                if (event.detail === 0) {
                  onPlaceAtFree(type);
                }
              }}
            >
              <PaletteIcon type={type} />
              <span className="palette-label">{COMPONENT_DEFS[type].label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
