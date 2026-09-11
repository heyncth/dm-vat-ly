import './ResetButton.css';

type ResetButtonProps = {
  onReset: () => void;
};

export default function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button type="button" className="reset-button" onClick={onReset} aria-label="Đặt lại thí nghiệm">
      <span aria-hidden="true">↻</span> ĐẶT LẠI
    </button>
  );
}
