// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { useAuiState } from '@assistant-ui/react';
import { StoppedRunProvider, useStoppedRun } from './StoppedRunProvider';

jest.mock('@assistant-ui/react', () => ({
  useAuiState: jest.fn(),
}));

let isRunning = false;

beforeEach(() => {
  isRunning = false;
  useAuiState.mockImplementation((selector) =>
    selector({ thread: { isRunning } })
  );
});

function Consumer() {
  const { stopRun, isStopped } = useStoppedRun();
  return (
    <div>
      <span data-testid="isStopped">{String(isStopped)}</span>
      <button type="button" onClick={stopRun}>
        stop
      </button>
    </div>
  );
}

function renderProvider({ onStop } = {}) {
  const view = render(
    <StoppedRunProvider onStop={onStop}>
      <Consumer />
    </StoppedRunProvider>
  );

  return {
    ...view,
    setIsRunning: (value) => {
      isRunning = value;
      view.rerender(
        <StoppedRunProvider onStop={onStop}>
          <Consumer />
        </StoppedRunProvider>
      );
    },
  };
}

describe('useStoppedRun outside a provider', () => {
  it('returns an inert default value', async () => {
    const user = userEvent.setup();
    render(<Consumer />);

    expect(screen.getByTestId('isStopped')).toHaveTextContent('false');
    await user.click(screen.getByRole('button', { name: 'stop' }));

    expect(screen.getByTestId('isStopped')).toHaveTextContent('false');
  });
});

describe('StoppedRunProvider', () => {
  it('invokes onStop and flips isStopped to true when stopRun is called', async () => {
    const user = userEvent.setup();
    const onStop = jest.fn();
    isRunning = true;
    renderProvider({ onStop });

    await user.click(screen.getByRole('button', { name: 'stop' }));

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('isStopped')).toHaveTextContent('true');
  });

  it('does not clear isStopped when the stopped run merely ends (running -> not running)', async () => {
    const user = userEvent.setup();
    isRunning = true;
    const { setIsRunning } = renderProvider({ onStop: jest.fn() });

    await user.click(screen.getByRole('button', { name: 'stop' }));
    expect(screen.getByTestId('isStopped')).toHaveTextContent('true');

    setIsRunning(false);

    expect(screen.getByTestId('isStopped')).toHaveTextContent('true');
  });

  it('clears isStopped once a new run starts (not running -> running)', async () => {
    const user = userEvent.setup();
    isRunning = true;
    const { setIsRunning } = renderProvider({ onStop: jest.fn() });

    await user.click(screen.getByRole('button', { name: 'stop' }));
    expect(screen.getByTestId('isStopped')).toHaveTextContent('true');

    setIsRunning(false);
    setIsRunning(true);

    expect(screen.getByTestId('isStopped')).toHaveTextContent('false');
  });
});
