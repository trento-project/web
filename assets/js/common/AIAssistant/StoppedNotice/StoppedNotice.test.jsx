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

const mockIsLast = (isLast) =>
  useAuiState.mockImplementation((selector) =>
    selector({ message: { isLast } })
  );

describe('StoppedNoticeView', () => {
  it('renders its label', () => {
    render(<StoppedNoticeView>Response stopped.</StoppedNoticeView>);
    expect(screen.getByText('Response stopped.')).toBeVisible();
  });
});

describe('StoppedNotice', () => {
  it('renders the copy when the run was stopped and this is the last message', () => {
    mockIsLast(true);

    render(<StoppedNotice isStopped />);

    expect(screen.getByText('Response stopped.')).toBeVisible();
  });

  it('renders nothing when stopped but this is not the last message', () => {
    mockIsLast(false);

    const { container } = render(<StoppedNotice isStopped />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the run was not stopped, even on the last message', () => {
    mockIsLast(true);

    const { container } = render(<StoppedNotice isStopped={false} />);

    expect(container).toBeEmptyDOMElement();
  });
});
