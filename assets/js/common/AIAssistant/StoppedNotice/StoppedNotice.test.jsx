// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { useAuiState } from '@assistant-ui/react';
import { StoppedRunProvider, useStoppedRun } from '../StoppedRunProvider';
import StoppedNotice, { StoppedNoticeView } from './StoppedNotice';

jest.mock('@assistant-ui/react', () => ({
  useAuiState: jest.fn(),
}));

// StoppedNotice reads its own message id off `s.message.id`; the provider it
// is rendered under reads the thread's last message id off
// `s.thread.messages`. A test drives both through one shared selector so it
// can say "this component is message X" and "the thread's last message is Y"
// independently.
const mockState = (ownMessageId, lastMessageId = ownMessageId) =>
  useAuiState.mockImplementation((selector) =>
    selector({
      message: { id: ownMessageId },
      thread: { messages: lastMessageId ? [{ id: lastMessageId }] : [] },
    })
  );

// Stops the thread's last message through the real provider — the same path
// the composer's Stop button uses.
function StopButton() {
  const { stopRun } = useStoppedRun();
  return (
    <button type="button" onClick={stopRun}>
      stop
    </button>
  );
}

describe('StoppedNoticeView', () => {
  it('renders its label', () => {
    render(<StoppedNoticeView>Response stopped.</StoppedNoticeView>);
    expect(screen.getByText('Response stopped.')).toBeVisible();
  });
});

describe('StoppedNotice', () => {
  it('renders the copy when the context reports this message id stopped', async () => {
    const user = userEvent.setup();
    mockState('m1');

    render(
      <StoppedRunProvider onStop={() => true}>
        <StopButton />
        <StoppedNotice />
      </StoppedRunProvider>
    );

    await user.click(screen.getByRole('button', { name: 'stop' }));

    expect(screen.getByText('Response stopped.')).toBeVisible();
  });

  it('renders nothing when a different message was stopped', async () => {
    const user = userEvent.setup();
    // This component is message m2; the thread's last (and stopped) message
    // is m1 — an earlier turn.
    mockState('m2', 'm1');

    render(
      <StoppedRunProvider onStop={() => true}>
        <StopButton />
        <StoppedNotice />
      </StoppedRunProvider>
    );

    await user.click(screen.getByRole('button', { name: 'stop' }));

    expect(screen.queryByText('Response stopped.')).not.toBeInTheDocument();
  });

  it('renders nothing when nothing has been stopped', () => {
    mockState('m1');

    const { container } = render(
      <StoppedRunProvider onStop={() => true}>
        <StoppedNotice />
      </StoppedRunProvider>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
