import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App.tsx';
import { experimentConfig } from '../config/experimentConfig.ts';

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

describe('experiment dataset', () => {
  it('matches the locked five-trial measurement set', () => {
    expect(experimentConfig.trials).toEqual([
      { lan: 1, U: 2.01, I: 0.201 },
      { lan: 2, U: 3.02, I: 0.301 },
      { lan: 3, U: 4.01, I: 0.399 },
      { lan: 4, U: 5.02, I: 0.501 },
      { lan: 5, U: 6.01, I: 0.601 },
    ]);
  });
});

describe('Phase 4 measurement engine', () => {
  it('starts with play button disabled (circuit incomplete)', () => {
    render(<App />);
    openControls();

    expect(within(rail()).getByRole('button', { name: /chạy mô phỏng/i })).toBeDisabled();
    expect(within(rail()).getByText(/mạch chưa đầy đủ/i)).toBeInTheDocument();
  });

  it('enables play when sample circuit is complete', () => {
    render(<App />);
    openControls();
    sampleCircuit();

    expect(within(rail()).getByRole('button', { name: /chạy mô phỏng/i })).toBeEnabled();
  });

  it('runs and stops simulation with auto-record', () => {
    render(<App />);
    openControls();
    sampleCircuit();
    selectTrial(1);
    runSimulation();

    expect(within(rail()).getByRole('button', { name: /dừng mô phỏng/i })).toBeInTheDocument();

    stopSimulation();

    // Auto-recorded: trial 1 dot should show checkmark
    const trialDots = within(rail()).getAllByRole('button').filter(d => d.className.includes('trial-dot'));
    expect(trialDots[0]).toHaveTextContent('✓');
  });

  it('resets switch visual when simulation stops', () => {
    render(<App />);
    openControls();
    sampleCircuit();
    selectTrial(1);
    runSimulation();
    stopSimulation();

    // After stopping, play button should be available again (switch is open, but circuit is still valid)
    expect(within(rail()).getByRole('button', { name: /chạy mô phỏng/i })).toBeInTheDocument();
  });
});
