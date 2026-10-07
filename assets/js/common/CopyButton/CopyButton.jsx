// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import { EOS_CONTENT_COPY } from 'eos-icons-react';
import { noop } from 'lodash';
import copy from 'copy-to-clipboard';
import { logError } from '@lib/log';
import Tooltip from '@common/Tooltip';

export const COPIED_FEEDBACK_MS = 2000;

const copyDefaultOpts = {
  fallbackToPrompt: true, // keep 3.x.x compatibility. prompt fallback was enabled there
};

// writeToClipboard returns a Promise that resolves into a boolean.
// Make sure both flavours go out in a single clipboard event:
// - `text/html` so rich targets (docs, mail, ticket trackers) keep the formatting
// - `text/plain` so everything else gets `content` as it would have without the HTML
export const writeToClipboard = (content, html) => {
  if (!html) return copy(content, copyDefaultOpts);

  return copy(content, {
    ...copyDefaultOpts,
    format: 'text/html',
    onCopy: (data) => {
      // compatible for browsers without the new navigator.clipboard
      if (data instanceof DataTransfer) {
        data.setData('text/plain', content);
        data.setData('text/html', html);
        return;
      }

      return new ClipboardItem({
        'text/plain': new Blob([content], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' }),
      });
    },
  });
};

function CopyButton({
  content,
  getHtml = noop,
  onCopy = undefined,
  isCopied = false,
}) {
  const [copied, setCopied] = useState(false);
  const contentCopied = isCopied || copied;

  useEffect(() => {
    if (!copied) return undefined;

    const timeout = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copyText = async () => {
    if (onCopy) return onCopy();

    const copyResult = await writeToClipboard(content, getHtml());
    if (copyResult) {
      setCopied(true);
    } else {
      logError('clipboard write failed');
    }
  };

  return (
    <Tooltip content="Copied to clipboard" visible={contentCopied} wrap={false}>
      <button
        type="button"
        onClick={() => copyText()}
        aria-label="copy to clipboard"
        className="hover:bg-gray-100 rounded-full p-2 hover:opacity-60"
      >
        <EOS_CONTENT_COPY className="p-1 mx-auto" role="button" size="25" />
      </button>
    </Tooltip>
  );
}

export default CopyButton;
