import React from 'react';
import {
  PromptComposer,
  COMPOSER_INPUT_CLASS_NAME,
  COMPOSER_SEND_BUTTON_CLASS_NAME,
} from './PromptComposer';

const renderInput = ({ placeholder, disabled }) => (
  <textarea
    placeholder={placeholder}
    disabled={disabled}
    className={COMPOSER_INPUT_CLASS_NAME}
    aria-label="Message input"
  />
);

const renderSend = ({ disabled }) => (
  <button
    type="submit"
    disabled={disabled}
    className={COMPOSER_SEND_BUTTON_CLASS_NAME}
  >
    Send
  </button>
);

export default {
  title: 'Components/AIAssistant/PromptComposer',
  component: PromptComposer,
  parameters: {
    layout: 'padded',
  },
};

export const Idle = {
  render: () => (
    <PromptComposer
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
    <PromptComposer
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
    <PromptComposer
      inputSlot={renderInput({
        placeholder: 'How can I help you?',
        disabled: false,
      })}
    />
  ),
};
