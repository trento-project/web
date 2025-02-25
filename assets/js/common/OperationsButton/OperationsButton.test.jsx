import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import OperationsButton from './OperationsButton';

const mockOnClick = jest.fn();
const testOperations = [
  {
    value: 'Operation 1',
    running: false,
    disabled: false,
    onClick: mockOnClick,
  },
  {
    value: 'Operation 2',
    running: false,
    disabled: false,
    onClick: mockOnClick,
  },
];

describe('OperationsButton', () => {
  it('should show correct operations', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<OperationsButton operations={testOperations} />);
    });

    expect(screen.getByText('Operations')).toBeInTheDocument();

    await user.click(screen.getByText('Operations'));

    expect(screen.getByText('Operation 1')).toBeInTheDocument();
    expect(screen.getByText('Operation 2')).toBeInTheDocument();

    await user.click(screen.getByText('Operation 1'));

    expect(mockOnClick).toBeCalled();
  });

  it('should show disabled operation', async () => {
    const user = userEvent.setup();
    const disabledOperations = Object.assign([], testOperations, {
      0: { ...testOperations[0], disabled: true },
    });

    await act(async () => {
      render(<OperationsButton operations={disabledOperations} />);
    });

    await user.click(screen.getByText('Operations'));

    expect(screen.getByText('Operation 1')).toBeDisabled();
    expect(screen.getByText('Operation 2')).toBeEnabled();
  });

  it('should show running operation with disabled entries', async () => {
    const user = userEvent.setup();
    const runningOperations = Object.assign([], testOperations, {
      0: { ...testOperations[0], running: true },
    });

    await act(async () => {
      render(<OperationsButton operations={runningOperations} />);
    });

    await user.click(screen.getByText('Operations'));

    expect(screen.getByText('Operation 1')).toBeDisabled();
    expect(screen.getByText('Operation 2')).toBeDisabled();

    const svgEl = screen
      .getByRole('menuitem', { name: 'Operation 1' })
      .querySelector("[data-testid='eos-svg-component']");
    expect(svgEl).toBeInTheDocument();
  });
});
