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

// StoppedNotice reads its own position off `s.message.index`; the provider it
// is rendered under derives the thread's last position from
// `s.thread.messages.length`. A test drives both through one shared selector
// so it can say "this component is message N" and "the thread's last message
// is M" independently.
const mockState = (ownIndex, lastIndex = ownIndex) =>
  useAuiState.mockImplementation((selector) =>
    selector({
      message: { index: ownIndex },
      thread: { messages: Array.from({ length: lastIndex + 1 }, () => ({})) },
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
  it('renders the copy when the context reports this message stopped', async () => {
    const user = userEvent.setup();
    mockState(0);

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
    // This component is message index 1; the thread's last (and stopped)
    // message is index 0 — an earlier turn.
    mockState(1, 0);

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
    mockState(0);

    const { container } = render(
      <StoppedRunProvider onStop={() => true}>
        <StoppedNotice />
      </StoppedRunProvider>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
