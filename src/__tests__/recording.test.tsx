import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App.tsx';

function openControls() {
  fireEvent.click(screen.getByRole('button', { name: 'Điều khiển' }));
}

function rail() {
  return screen.getByTestId('control-rail');
}

function sampleCircuit() {
  fireEvent.click(within(rail()).getByRole('button', { name: 'Mạch mẫu' }));
}

function runSimulation() {
  fireEvent.click(within(rail()).getByRole('button', { name: /chạy mô phỏng/i }));
}

function stopSimulation() {
  fireEvent.click(within(rail()).getByRole('button', { name: /dừng mô phỏng/i }));
}

function selectTrial(n: number) {
  const dots = within(rail()).getAllByRole('button', { name: String(n) });
  const dot = dots.find((d) => d.className.includes('trial-dot'));
  if (dot) fireEvent.click(dot);
}

describe('trial selection (no auto-record)', () => {
  it('trial dots always show numbers, no checkmark', () => {
    render(<App />);
    openControls();
    sampleCircuit();
    selectTrial(1);
    runSimulation();
    stopSimulation();

    const trialDots = within(rail()).getAllByRole('button').filter(d => d.className.includes('trial-dot'));
    expect(trialDots[0]).toHaveTextContent('1');
  });

  it('can select and deselect trials', () => {
    render(<App />);
    openControls();
    sampleCircuit();

    selectTrial(1);
    expect(within(rail()).getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'true');

    selectTrial(1);
    expect(within(rail()).getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('resets on reset', () => {
    render(<App />);
    openControls();
    sampleCircuit();
    selectTrial(1);
    runSimulation();
    stopSimulation();

    fireEvent.click(screen.getByRole('button', { name: /đặt lại/i }));
    openControls();
    expect(within(rail()).getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'false');
  });
});
