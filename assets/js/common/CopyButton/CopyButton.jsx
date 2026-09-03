// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import { EOS_CONTENT_COPY } from 'eos-icons-react';
import { noop } from 'lodash';
import copy from 'copy-to-clipboard';
import Tooltip from '@common/Tooltip';

export const COPIED_FEEDBACK_MS = 2000;

// Make sure both flavours go out in a single clipboard event:
// - `text/html` so rich targets (docs, mail, ticket trackers) keep the formatting
// - `text/plain` so everything else gets `content` as it would have without the HTML
export const writeToClipboard = (content, html) => {
  if (!html) return copy(content);

  return copy(content, {
    onCopy: (clipboardData) => {
      clipboardData.setData('text/plain', content);
      clipboardData.setData('text/html', html);
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

  const copyText = () => {
    if (onCopy) return onCopy();

    writeToClipboard(content, getHtml());
    setCopied(true);
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
