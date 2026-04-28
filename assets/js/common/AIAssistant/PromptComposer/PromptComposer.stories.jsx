import React from 'react';

import Button from '@common/Button';

import { PromptComposerView, PromptInput } from './PromptComposer';

const renderInput = ({ placeholder, disabled }) => (
  <PromptInput
    as="textarea"
    placeholder={placeholder}
    disabled={disabled}
    aria-label="Message input"
  />
);

const renderSend = ({ disabled }) => (
  <Button asSubmit type="default-fit" disabled={disabled}>
    Send
  </Button>
);

export default {
  title: 'Components/AIAssistant/PromptComposer',
  component: PromptComposerView,
  parameters: {
    layout: 'padded',
  },
};

export const Idle = {
  render: () => (
    <PromptComposerView
      inputSlot={renderInput({
        placeholder: 'How can I help you?',
        disabled: false,
      })}
      actionSlot={renderSend({ disabled: false })}
    />
  ),
};

export const Disabled = {
  render: () => (
    <PromptComposerView
      inputSlot={renderInput({
        placeholder: 'Offline - waiting to reconnect...',
        disabled: true,
      })}
      actionSlot={renderSend({ disabled: true })}
    />
  ),
};

export const Sending = {
  render: () => (
    <PromptComposerView
      inputSlot={renderInput({
        placeholder: 'How can I help you?',
        disabled: false,
      })}
    />
  ),
};
