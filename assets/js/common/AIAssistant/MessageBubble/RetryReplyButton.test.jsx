// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useAuiState } from '@assistant-ui/react';
import { useActionBarReload } from '@assistant-ui/core/react';

import RetryReplyButton from './RetryReplyButton';

// Only the two hooks are stubbed. The real `ActionBarPrimitive.Reload` stays in
// the tree, so what is under test is our wiring through it: the disabled state
// it derives from the hook and the callback it composes onto our button.
jest.mock('@assistant-ui/react', () => ({
  __esModule: true,
  ...jest.requireActual('@assistant-ui/react'),
  useAuiState: jest.fn(),
}));

jest.mock('@assistant-ui/core/react', () => ({
  __esModule: true,
  ...jest.requireActual('@assistant-ui/core/react'),
  useActionBarReload: jest.fn(),
}));

const retryButton = () => screen.queryByRole('button', { name: 'retry' });

const renderButton = ({ isLast = true, ...state } = {}) => {
  useAuiState.mockImplementation((selector) =>
    selector({ message: { isLast } })
  );

  const reload = jest.fn();
  useActionBarReload.mockReturnValue({ reload, disabled: false, ...state });

  render(<RetryReplyButton />);

  return { reload };
};

describe('RetryReplyButton', () => {
  it('offers to retry the newest reply', () => {
    renderButton();

    expect(retryButton()).toBeEnabled();
  });

  it('does not offer to retry an earlier reply', () => {
    renderButton({ isLast: false });

    expect(retryButton()).not.toBeInTheDocument();
  });

  it('stays out of the way while the library reports the thread busy', () => {
    renderButton({ disabled: true });

    expect(retryButton()).not.toBeInTheDocument();
  });

  it('leaves the re-run itself to the library', async () => {
    const user = userEvent.setup();
    const { reload } = renderButton();

    await user.click(retryButton());

    expect(reload).toHaveBeenCalled();
  });
});
