// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useActionBarCopy } from '@assistant-ui/core/react';

import CopyReplyButton from './CopyReplyButton';

jest.mock('@assistant-ui/core/react', () => ({
  useActionBarCopy: jest.fn(),
}));

const REPLY_MARKDOWN = 'All **3** hosts are healthy.';
const REPLY_HTML = '<p>All <strong>3</strong> hosts are healthy.</p>';

const copyButton = () =>
  screen.queryByRole('button', { name: 'copy to clipboard' });

const renderButton = (contentRef = { current: null }, state = {}) => {
  useActionBarCopy.mockReturnValue({
    copy: jest.fn(),
    disabled: false,
    isCopied: false,
    ...state,
  });

  const onWriteToClipboard = jest.fn(() => true);

  render(
    <CopyReplyButton
      contentRef={contentRef}
      onWriteToClipboard={onWriteToClipboard}
    />
  );

  return { onWriteToClipboard };
};

const writeReply = (text = REPLY_MARKDOWN) => {
  const [options] = useActionBarCopy.mock.lastCall;

  return options.copyToClipboard(text);
};

describe('CopyReplyButton', () => {
  it('allows copying a copyable reply', () => {
    renderButton();

    expect(copyButton()).toBeVisible();
  });

  it('does not allow copying while there is no reply to copy', () => {
    renderButton(undefined, { disabled: true });

    expect(copyButton()).not.toBeInTheDocument();
  });

  it('calls assistant ui copy function', async () => {
    const user = userEvent.setup();
    const copyReply = jest.fn();

    renderButton(undefined, { copy: copyReply });
    await user.click(copyButton());

    expect(copyReply).toHaveBeenCalled();
  });

  it('copies the markdown and html', async () => {
    const contentRef = { current: { innerHTML: '<p>partial</p>' } };
    const { onWriteToClipboard } = renderButton(contentRef);

    contentRef.current.innerHTML = REPLY_HTML;

    await writeReply();

    expect(onWriteToClipboard).toHaveBeenCalledWith(REPLY_MARKDOWN, REPLY_HTML);
  });

  it('copies the markdown alone when the reply has no rendered markup', async () => {
    const { onWriteToClipboard } = renderButton();

    await writeReply();

    expect(onWriteToClipboard).toHaveBeenCalledWith(REPLY_MARKDOWN, undefined);
  });

  it('leaves the copy unconfirmed when the clipboard write fails', async () => {
    const { onWriteToClipboard } = renderButton({
      current: { innerHTML: REPLY_HTML },
    });

    onWriteToClipboard.mockReturnValue(false);

    await expect(writeReply()).rejects.toThrow();
  });

  it('confirms the copy for as long as the library holds the reply as copied', () => {
    renderButton(undefined, { isCopied: true });

    expect(screen.getByText('Copied to clipboard')).toBeInTheDocument();
  });
});
