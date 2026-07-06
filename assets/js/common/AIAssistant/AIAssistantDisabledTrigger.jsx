// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Link } from 'react-router';
import { EOS_CHAT_BUBBLE_OUTLINED } from 'eos-icons-react';

import Button from '@common/Button';
import Tooltip from '@common/Tooltip';

const disabledTooltipContent = (
  <span>
    AI Assistant is disabled. Please check{' '}
    <Link to="/profile" className="underline hover:opacity-75">
      Profile
    </Link>{' '}
    for Settings.
  </span>
);

// Rendered in place of the AI Assistant when the current user has no AI
// settings. Mirrors the fab position of `ModalFrame`'s anchor, but the button
// is disabled and never opens the chat — a hover tooltip points the user to
// their Profile to configure it.
function AIAssistantDisabledTrigger() {
  return (
    <div className="fixed right-6 bottom-20 size-12 z-40">
      <Tooltip content={disabledTooltipContent} place="left" mouseLeaveDelay={0.3}>
        <Button
          type="fab"
          size="none"
          className="size-full"
          disabled
          data-testid="ai-assistant-trigger-disabled"
          aria-label="AI Assistant is disabled"
        >
          <EOS_CHAT_BUBBLE_OUTLINED className="fill-white" />
        </Button>
      </Tooltip>
    </div>
  );
}

export default AIAssistantDisabledTrigger;
