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

// The status the AG-UI aggregator writes when the runtime's cancel path
// dispatches RUN_CANCELLED. Everything else — a finished answer, an errored
// one — is a different shape, and only this one is "the user stopped it".
const mockStatus = (status) =>
  useAuiState.mockImplementation((selector) =>
    selector({ message: { status } })
  );

describe('StoppedNoticeView', () => {
  it('renders its label', () => {
    render(<StoppedNoticeView>Response stopped.</StoppedNoticeView>);
    expect(screen.getByText('Response stopped.')).toBeVisible();
  });
});

describe('StoppedNotice', () => {
  it('renders the copy when the run was cancelled', () => {
    mockStatus({ type: 'incomplete', reason: 'cancelled' });

    render(<StoppedNotice />);

    expect(screen.getByText('Response stopped.')).toBeVisible();
  });

  it('renders nothing when the answer completed', () => {
    mockStatus({ type: 'complete', reason: 'unknown' });

    const { container } = render(<StoppedNotice />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the run is still streaming', () => {
    mockStatus({ type: 'running' });

    const { container } = render(<StoppedNotice />);

    expect(container).toBeEmptyDOMElement();
  });

  // An incomplete run has more than one reason. A failed answer already
  // surfaces through MessageError — labelling it "Response stopped." would
  // blame the user for the server's problem.
  it('renders nothing when the run failed', () => {
    mockStatus({ type: 'incomplete', reason: 'error', error: 'boom' });

    const { container } = render(<StoppedNotice />);

    expect(container).toBeEmptyDOMElement();
  });
});
