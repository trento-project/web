// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useActionBarReload } from '@assistant-ui/core/react';

import RetryReplyButton from './RetryReplyButton';

jest.mock('@assistant-ui/core/react', () => ({
  useActionBarReload: jest.fn(),
}));

const retryButton = () => screen.queryByRole('button', { name: 'retry' });

const renderRetryButton = ({
  isLast = true,
  isChatActive = true,
  ...reloadState
} = {}) => {
  const reload = jest.fn();
  useActionBarReload.mockReturnValue({
    reload,
    disabled: false,
    ...reloadState,
  });

  render(<RetryReplyButton isChatActive={isChatActive} isLast={isLast} />);

  return { reload };
};

describe('RetryReplyButton', () => {
  it('allows to retry latest reply', () => {
    renderRetryButton({ isLast: true });

    expect(retryButton()).toBeEnabled();
  });

  it('does not allow retrying previous replies', () => {
    renderRetryButton({ isLast: false });

    expect(retryButton()).not.toBeInTheDocument();
  });

  it('cannot retry while the chat is read-only', () => {
    renderRetryButton({ isChatActive: false });

    expect(retryButton()).not.toBeInTheDocument();
  });

  it('cannot retry while the thread is busy', () => {
    renderRetryButton({ disabled: true });

    expect(retryButton()).not.toBeInTheDocument();
  });

  it('retries the latest reply', async () => {
    const user = userEvent.setup();
    const { reload } = renderRetryButton({ isLast: true });

    await user.click(retryButton());

    expect(reload).toHaveBeenCalled();
  });
});
