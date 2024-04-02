import React, { useEffect, useState } from 'react';
import { EOS_CONTENT_COPY } from 'eos-icons-react';
import copy from 'copy-to-clipboard';
import Tooltip from '@common/Tooltip';

function CopyButton({ content }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  const copyText = () => {
    copy(content);
    setCopied(true);
  };

  return (
    <Tooltip
      content="Copied to clipboard"
      isEnabled={copied}
      mouseLeaveDelay={2}
    >
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
