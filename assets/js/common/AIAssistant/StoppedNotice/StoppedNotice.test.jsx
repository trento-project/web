// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useAuiState } from '@assistant-ui/react';
import StoppedNotice, { StoppedNoticeView } from './StoppedNotice';

jest.mock('@assistant-ui/react', () => ({
  useAuiState: jest.fn(),
}));

const mockMessage = (message) => useAuiState.mockReturnValue(message);

describe('StoppedNoticeView', () => {
  it('renders its label', () => {
    render(<StoppedNoticeView>Response stopped.</StoppedNoticeView>);
    expect(screen.getByText('Response stopped.')).toBeVisible();
  });
});

describe('StoppedNotice', () => {
  it('marks a message the user stopped', () => {
    mockMessage({ status: { type: 'incomplete', reason: 'cancelled' } });

    render(<StoppedNotice />);

    expect(screen.getByText('Response stopped.')).toBeVisible();
  });

  it.each([
    { label: 'still streaming', status: { type: 'running' } },
    {
      label: 'finished normally',
      status: { type: 'complete', reason: 'stop' },
    },
    // The run died on its own — MessageError owns that case, and two notices
    // under one answer read as two separate failures.
    {
      label: 'incomplete for another reason',
      status: { type: 'incomplete', reason: 'error' },
    },
    { label: 'carrying no status at all', status: undefined },
  ])('renders nothing for a message $label', ({ status }) => {
    mockMessage({ status });

    const { container } = render(<StoppedNotice />);

    expect(container).toBeEmptyDOMElement();
  });
});
