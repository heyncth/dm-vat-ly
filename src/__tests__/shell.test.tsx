import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App.tsx';

describe('Phase 1 experiment shell', () => {
  it('renders fullscreen workspace with panels hidden and toggles available', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /định luật ohm/i })).toBeInTheDocument();
    expect(screen.getByTestId('simulation-workspace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đặt lại/i })).toBeInTheDocument();

    const controlsToggle = screen.getByRole('button', { name: 'Điều khiển' });
    expect(controlsToggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('control-rail')).not.toBeInTheDocument();
  });

  it('opens the sidebar from the toolbar and shows control rail', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Điều khiển' }));

    expect(screen.getByRole('button', { name: 'Điều khiển' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByTestId('control-rail')).toBeInTheDocument();
  });

  it('toggles sidebar closed when clicking again', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Điều khiển' }));
    expect(screen.getByTestId('control-rail')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Điều khiển' }));
    expect(screen.queryByTestId('control-rail')).not.toBeInTheDocument();
  });

  it('reset closes open panels and announces through a live region', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Điều khiển' }));
    expect(screen.getByTestId('control-rail')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /đặt lại/i }));

    expect(screen.queryByTestId('control-rail')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/đặt lại/i);
  });
});
