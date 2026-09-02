// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useActionBarCopy } from '@assistant-ui/core/react';

import CopyButton, {
  COPIED_FEEDBACK_MS,
  writeToClipboard,
} from '@common/CopyButton';

// Copies the reply in both flavours:
// - the markdown source as plain text
// - `contentRef`'s markup as HTML
//
// This allows pasting both the plain markdown and the HTML into a rich target, keeping the
// formatting intact.
function CopyReplyButton({
  contentRef,
  onWriteToClipboard = writeToClipboard,
}) {
  const { copy, disabled, isCopied } = useActionBarCopy({
    copiedDuration: COPIED_FEEDBACK_MS,
    copyToClipboard: async (markdown) => {
      if (!onWriteToClipboard(markdown, contentRef?.current?.innerHTML)) {
        throw new Error('clipboard write failed');
      }
    },
  });

  if (disabled) return null;

  return <CopyButton onCopy={copy} isCopied={isCopied} />;
}

export default CopyReplyButton;
