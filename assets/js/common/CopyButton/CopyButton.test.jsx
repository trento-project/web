// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import copy from 'copy-to-clipboard';

import CopyButton from './CopyButton';

jest.mock('copy-to-clipboard', () => jest.fn());

const getCopyButton = () =>
  screen.getByRole('button', { name: 'copy to clipboard' });

const writtenContentTypes = () => {
  const [, options] = copy.mock.calls[0];
  const setData = jest.fn();

  options.onCopy({ setData });

  return Object.fromEntries(setData.mock.calls);
};

describe('CopyButton', () => {
  it('copies plain content as it is', async () => {
    const user = userEvent.setup();
    render(<CopyButton content="an-api-key" />);

    await user.click(getCopyButton());

    expect(copy).toHaveBeenCalledWith('an-api-key');
  });

  it('copies the HTML alongside the plain content when one is available', async () => {
    const user = userEvent.setup();
    render(
      <CopyButton
        content="**bold**"
        getHtml={() => '<p><strong>bold</strong></p>'}
      />
    );

    await user.click(getCopyButton());

    expect(writtenContentTypes()).toEqual({
      'text/plain': '**bold**',
      'text/html': '<p><strong>bold</strong></p>',
    });
  });

  it('reads the HTML on click, not on render', async () => {
    const user = userEvent.setup();
    const getHtml = jest.fn(() => '<p>done</p>');

    render(<CopyButton content="done" getHtml={getHtml} />);

    expect(getHtml).not.toHaveBeenCalled();

    await user.click(getCopyButton());

    expect(getHtml).toHaveBeenCalled();
  });

  it('falls back to plain content when there is no HTML to copy', async () => {
    const user = userEvent.setup();
    render(<CopyButton content="plain" />);

    await user.click(getCopyButton());

    expect(copy).toHaveBeenCalledWith('plain');
  });

  it('delegates the copy to the caller', async () => {
    const user = userEvent.setup();
    const onCopy = jest.fn();

    render(<CopyButton content="an-api-key" onCopy={onCopy} />);

    await user.click(getCopyButton());

    expect(onCopy).toHaveBeenCalled();
    expect(copy).not.toHaveBeenCalled();
  });

  it('shows a copy confirmation', async () => {
    render(<CopyButton content="an-api-key" isCopied onCopy={jest.fn()} />);

    expect(screen.getByText('Copied to clipboard')).toBeVisible();
  });

  it('internal copy confirmation is ignored when copy is controlled by the caller', async () => {
    const user = userEvent.setup();

    render(
      <CopyButton content="an-api-key" isCopied={false} onCopy={jest.fn()} />
    );

    await user.click(getCopyButton());

    expect(screen.queryByText('Copied to clipboard')).not.toBeInTheDocument();
  });

  it('shows the copy confirmation when the caller sets it', async () => {
    const onCopy = jest.fn();
    const withCopied = (isCopied) => (
      <CopyButton content="an-api-key" isCopied={isCopied} onCopy={onCopy} />
    );

    const { rerender } = render(withCopied(false));

    rerender(withCopied(true));

    expect(screen.getByText('Copied to clipboard')).toBeVisible();
  });

  it('confirms the copy, then tooltip disappears again', async () => {
    const user = userEvent.setup();
    render(<CopyButton content="an-api-key" />);

    expect(screen.queryByText('Copied to clipboard')).not.toBeInTheDocument();

    await user.click(getCopyButton());

    const confirmation = () =>
      screen.getByText('Copied to clipboard').closest('.rc-tooltip');

    expect(confirmation()).not.toHaveClass('rc-tooltip-visible');

    await waitFor(
      () => expect(confirmation()).toHaveClass('rc-tooltip-hidden'),
      { timeout: 4000 }
    );
  }, 10000);
});
