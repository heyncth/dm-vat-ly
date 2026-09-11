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

describe('Phase 6 auto-recording', () => {
  it('auto-records when simulation stops with a trial selected', () => {
    render(<App />);
    openControls();
    sampleCircuit();
    selectTrial(1);
    runSimulation();
    stopSimulation();

    // Trial 1 dot should now show checkmark (recorded)
    const trialDots = within(rail()).getAllByRole('button').filter(d => d.className.includes('trial-dot'));
    expect(trialDots[0]).toHaveTextContent('✓');
  });

  it('prevents recording the same trial twice', () => {
    render(<App />);
    openControls();
    sampleCircuit();
    selectTrial(1);
    runSimulation();
    stopSimulation();
    // Trial 1 recorded
    const trialDots = within(rail()).getAllByRole('button').filter(d => d.className.includes('trial-dot'));
    expect(trialDots[0]).toHaveTextContent('✓');
    // Select trial 2 and record
    selectTrial(2);
    runSimulation();
    stopSimulation();
    expect(trialDots[1]).toHaveTextContent('✓');
  });

  it('shows trial count progressing', () => {
    render(<App />);
    openControls();
    sampleCircuit();
    selectTrial(1);
    runSimulation();
    stopSimulation();
    expect(within(rail()).getByText('1 / 5')).toBeInTheDocument();

    selectTrial(2);
    runSimulation();
    stopSimulation();
    expect(within(rail()).getByText('2 / 5')).toBeInTheDocument();
  });

  it('clears on reset', () => {
    render(<App />);
    openControls();
    sampleCircuit();
    selectTrial(1);
    runSimulation();
    stopSimulation();

    fireEvent.click(screen.getByRole('button', { name: /đặt lại/i }));
    openControls();
    expect(within(rail()).getByText('0 / 5')).toBeInTheDocument();
  });
});
