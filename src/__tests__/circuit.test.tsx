import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App.tsx';

function stage() {
  return screen.getByTestId('simulation-workspace');
}

function addComponent(label: string) {
  const palette = screen.getByRole('toolbar', { name: /hộp dụng cụ/i });
  fireEvent.click(within(palette).getByRole('button', { name: new RegExp(label) }));
}

function stageNode(label: RegExp) {
  return within(stage()).getByRole('button', { name: label });
}

describe('Phase 2 circuit editing', () => {
  it('offers five parts in the palette', () => {
    render(<App />);

    for (const name of ['Nguồn điện', 'Điện trở', 'Ampe kế', 'Vôn kế', 'Công tắc']) {
      expect(screen.getByRole('button', { name: new RegExp(name) })).toBeInTheDocument();
    }
  });

  it('places, selects, and deletes a component via toolbar X button', () => {
    render(<App />);

    addComponent('Điện trở');
    const node = stageNode(/linh kiện điện trở/i);
    expect(node).toBeInTheDocument();

    // Select the component
    fireEvent.click(node);

    // Click the inline SVG delete button (× text in toolbar)
    const svgStage = stage();
    const deleteBtn = svgStage.querySelector('.inline-toolbar-btn--delete');
    expect(deleteBtn).toBeTruthy();
    fireEvent.click(deleteBtn!);

    expect(within(stage()).queryByRole('button', { name: /linh kiện điện trở/i })).not.toBeInTheDocument();
  });

  it('connects two terminals with a wire', () => {
    render(<App />);

    addComponent('Nguồn điện');
    addComponent('Điện trở');

    fireEvent.click(stageNode(/nguồn điện, chốt trái/i));
    expect(screen.getByText(/đã chọn 1 chốt/i)).toBeInTheDocument();

    fireEvent.click(stageNode(/điện trở, chốt trái/i));

    expect(stage().querySelector('line.wire')).not.toBeNull();
  });

  it('moves a focused node with arrow keys', () => {
    render(<App />);

    addComponent('Ampe kế');
    const before = stageNode(/linh kiện ampe kế/i).closest('g')?.getAttribute('transform');

    const node = stageNode(/linh kiện ampe kế/i);
    node.focus();
    fireEvent.keyDown(node, { key: 'ArrowRight' });

    const after = stageNode(/linh kiện ampe kế/i).closest('g')?.getAttribute('transform');
    expect(after).not.toBe(before);
  });

  it('reset clears the assembled circuit', () => {
    render(<App />);

    addComponent('Vôn kế');
    expect(stageNode(/linh kiện vôn kế/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /đặt lại/i }));
    expect(within(stage()).queryByRole('button', { name: /linh kiện vôn kế/i })).not.toBeInTheDocument();
  });
});

describe('Phase 3 sample circuit', () => {
  function openControls() {
    fireEvent.click(screen.getByRole('button', { name: 'Điều khiển' }));
  }

  it('builds five parts and six wires from Mạch mẫu', () => {
    render(<App />);
    openControls();

    fireEvent.click(screen.getByRole('button', { name: 'Mạch mẫu' }));

    expect(
      within(stage()).getAllByRole('button', { name: /linh kiện/i }),
    ).toHaveLength(5);
    expect(stage().querySelectorAll('line.wire')).toHaveLength(6);
  });

  it('repeated clicks replace instead of duplicating the sample', () => {
    render(<App />);
    openControls();

    const sampleButton = screen.getByRole('button', { name: 'Mạch mẫu' });
    fireEvent.click(sampleButton);
    fireEvent.click(sampleButton);

    expect(
      within(stage()).getAllByRole('button', { name: /linh kiện/i }),
    ).toHaveLength(5);
    expect(stage().querySelectorAll('line.wire')).toHaveLength(6);
  });

  it('a manual edit after the sample flips mode back', () => {
    render(<App />);
    openControls();
    fireEvent.click(screen.getByRole('button', { name: 'Mạch mẫu' }));

    // Manually add another component — circuit should still be valid
    addComponent('Điện trở');
    // 5 sample parts + 1 manual = 6 parts
    expect(within(stage()).getAllByRole('button', { name: /linh kiện/i })).toHaveLength(6);
  });

  it('reset clears the sample circuit and closes panels', () => {
    render(<App />);
    openControls();
    fireEvent.click(screen.getByRole('button', { name: 'Mạch mẫu' }));
    expect(
      within(stage()).getAllByRole('button', { name: /linh kiện/i }),
    ).toHaveLength(5);

    fireEvent.click(screen.getByRole('button', { name: /đặt lại/i }));

    expect(screen.queryByTestId('control-rail')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/đặt lại/i);
    fireEvent.click(screen.getByRole('button', { name: 'Điều khiển' }));
    expect(
      within(stage()).queryByRole('button', { name: /linh kiện/i }),
    ).not.toBeInTheDocument();
  });
});
