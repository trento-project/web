import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ActionsButton from './ActionsButton';

const mockOnClick = jest.fn();
const testActions = [
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

describe('ActionsButton', () => {
  it('should show correct actions', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<ActionsButton actions={testActions} />);
    });

    expect(screen.getByText('Actions')).toBeInTheDocument();

    await user.click(screen.getByText('Actions'));

    expect(screen.getByText('Operation 1')).toBeInTheDocument();
    expect(screen.getByText('Operation 2')).toBeInTheDocument();

    await user.click(screen.getByText('Operation 1'));

    expect(mockOnClick).toBeCalled();
  });

  it('should show disabled action', async () => {
    const user = userEvent.setup();
    const disabledActions = Object.assign([], testActions, {
      0: { ...testActions[0], disabled: true },
    });

    await act(async () => {
      render(<ActionsButton actions={disabledActions} />);
    });

    await user.click(screen.getByText('Actions'));

    expect(screen.getByText('Operation 1')).toBeDisabled();
    expect(screen.getByText('Operation 2')).toBeEnabled();
  });

  it('should show running action with disabled entries', async () => {
    const user = userEvent.setup();
    const runningActions = Object.assign([], testActions, {
      0: { ...testActions[0], running: true },
    });

    await act(async () => {
      render(<ActionsButton actions={runningActions} />);
    });

    await user.click(screen.getByText('Actions'));

    expect(screen.getByText('Operation 1')).toBeDisabled();
    expect(screen.getByText('Operation 2')).toBeDisabled();

    const svgEl = screen
      .getByRole('menuitem', { name: 'Operation 1' })
      .querySelector("[data-testid='eos-svg-component']");
    expect(svgEl).toBeInTheDocument();
  });
});
