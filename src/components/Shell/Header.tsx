import type { PanelId } from '../../App.tsx';
import ResetButton from './ResetButton.tsx';
import './Header.css';

type HeaderProps = {
  openPanel: PanelId | null;
  onTogglePanel: (panel: PanelId) => void;
  onReset: () => void;
};

export default function Header({ openPanel, onTogglePanel, onReset }: HeaderProps) {
  return (
    <header className="shell-header">
      <h1 className="shell-title">THÍ NGHIỆM ĐỊNH LUẬT OHM - Nhóm 5 lớp 10/2</h1>
      <nav className="shell-toolbar" aria-label="Bảng điều khiển">
        <button
          type="button"
          className="toolbar-button"
          aria-expanded={openPanel === 'controls'}
          aria-controls="panel-controls"
          onClick={() => onTogglePanel('controls')}
        >
          Điều khiển
        </button>
        <ResetButton onReset={onReset} />
      </nav>
    </header>
  );
}
