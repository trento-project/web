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

const mockLastMessageId = (...ids) =>
  useAuiState.mockImplementation((selector) =>
    selector({ thread: { messages: ids.map((id) => ({ id })) } })
  );

beforeEach(() => {
  mockLastMessageId('m1');
});

function StopButton() {
  const { stopRun } = useStoppedRun();
  return (
    <button type="button" onClick={stopRun}>
      stop
    </button>
  );
}

function Marker({ messageId }) {
  const { isMessageStopped } = useStoppedRun();
  return (
    <span data-testid={`stopped-${messageId}`}>
      {String(isMessageStopped(messageId))}
    </span>
  );
}

describe('useStoppedRun outside a provider', () => {
  it('returns an inert default value', async () => {
    const user = userEvent.setup();
    render(
      <>
        <StopButton />
        <Marker messageId="m1" />
      </>
    );

    expect(screen.getByTestId('stopped-m1')).toHaveTextContent('false');
    await user.click(screen.getByRole('button', { name: 'stop' }));
    expect(screen.getByTestId('stopped-m1')).toHaveTextContent('false');
  });
});

describe('StoppedRunProvider', () => {
  it("marks the last message's id, and only that id, when stopped", async () => {
    const user = userEvent.setup();
    const onStop = jest.fn(() => true);

    render(
      <StoppedRunProvider onStop={onStop}>
        <StopButton />
        <Marker messageId="m1" />
        <Marker messageId="m2" />
      </StoppedRunProvider>
    );

    expect(screen.getByTestId('stopped-m1')).toHaveTextContent('false');

    await user.click(screen.getByRole('button', { name: 'stop' }));

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('stopped-m1')).toHaveTextContent('true');
    expect(screen.getByTestId('stopped-m2')).toHaveTextContent('false');
  });

  it('marks a second stopped message in addition to the first', async () => {
    const user = userEvent.setup();
    const onStop = jest.fn(() => true);

    const { rerender } = render(
      <StoppedRunProvider onStop={onStop}>
        <StopButton />
        <Marker messageId="m1" />
        <Marker messageId="m2" />
      </StoppedRunProvider>
    );

    await user.click(screen.getByRole('button', { name: 'stop' }));
    expect(screen.getByTestId('stopped-m1')).toHaveTextContent('true');

    // A follow-up prompt started a second run, whose placeholder is message
    // m2 — and the user stopped that one too.
    mockLastMessageId('m1', 'm2');
    rerender(
      <StoppedRunProvider onStop={onStop}>
        <StopButton />
        <Marker messageId="m1" />
        <Marker messageId="m2" />
      </StoppedRunProvider>
    );

    await user.click(screen.getByRole('button', { name: 'stop' }));

    expect(screen.getByTestId('stopped-m1')).toHaveTextContent('true');
    expect(screen.getByTestId('stopped-m2')).toHaveTextContent('true');
  });

  // The spec clause this whole rework exists for: the marker on the earlier,
  // cut-off message must not be cleared just because a new run has started.
  it('keeps marking an earlier stopped message after a new run starts on a later one', async () => {
    const user = userEvent.setup();
    const onStop = jest.fn(() => true);

    const { rerender } = render(
      <StoppedRunProvider onStop={onStop}>
        <StopButton />
        <Marker messageId="m1" />
      </StoppedRunProvider>
    );

    await user.click(screen.getByRole('button', { name: 'stop' }));
    expect(screen.getByTestId('stopped-m1')).toHaveTextContent('true');

    // A new run starts: the thread now has a fresh last message, but nothing
    // about that should touch the marker already placed on m1.
    mockLastMessageId('m1', 'm2');
    rerender(
      <StoppedRunProvider onStop={onStop}>
        <StopButton />
        <Marker messageId="m1" />
      </StoppedRunProvider>
    );

    expect(screen.getByTestId('stopped-m1')).toHaveTextContent('true');
  });

  it('marks nothing when onStop reports there was no run to stop', async () => {
    const user = userEvent.setup();
    const onStop = jest.fn(() => false);

    render(
      <StoppedRunProvider onStop={onStop}>
        <StopButton />
        <Marker messageId="m1" />
      </StoppedRunProvider>
    );

    await user.click(screen.getByRole('button', { name: 'stop' }));

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('stopped-m1')).toHaveTextContent('false');
  });
});
