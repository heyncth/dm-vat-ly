import { COMPONENT_DEFS, PALETTE_ORDER, type ComponentType } from '../../lib/circuitModel.ts';

type ComponentPaletteProps = {
  /** Pointer-drag from palette onto the stage (mouse/touch). */
  onPlaceStart: (event: React.PointerEvent, type: ComponentType) => void;
  /** Keyboard activation: place at a free spot. */
  onPlaceAtFree: (type: ComponentType) => void;
};

/**
 * Kit of parts. Each item can be dragged onto the stage or activated by
 * keyboard to place at a free spot.
 */
export default function ComponentPalette({
  onPlaceStart,
  onPlaceAtFree,
}: ComponentPaletteProps) {
  return (
    <div className="palette" role="toolbar" aria-label="Hộp dụng cụ">
      {PALETTE_ORDER.map((type) => (
        <button
          key={type}
          type="button"
          className="palette-item"
          onPointerDown={(event) => onPlaceStart(event, type)}
          onClick={(event) => {
            // Keyboard activation fires click with detail 0; pointer flow
            // already placed the component, so ignore real clicks.
            if (event.detail === 0) {
              onPlaceAtFree(type);
            }
          }}
        >
          <span className="palette-glyph" data-glyph={type} aria-hidden="true" />
          {COMPONENT_DEFS[type].label}
        </button>
      ))}
    </div>
  );
}
