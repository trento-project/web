import React from 'react';
import {
  ComposerChrome,
  COMPOSER_INPUT_CLASS_NAME,
  COMPOSER_SEND_BUTTON_CLASS_NAME,
} from './ComposerChrome';

const renderInput = ({ placeholder, disabled }) => (
  <textarea
    placeholder={placeholder}
    disabled={disabled}
    className={COMPOSER_INPUT_CLASS_NAME}
    aria-label="Message input"
  />
);

const renderSend = ({ disabled }) => (
  <button type="submit" disabled={disabled} className={COMPOSER_SEND_BUTTON_CLASS_NAME}>
    Send
  </button>
);

export default {
  title: 'Components/AIAssistant/ComposerChrome',
  component: ComposerChrome,
  parameters: {
    layout: 'padded',
  },
};

export const Idle = {
  render: () => (
    <ComposerChrome
      inputSlot={renderInput({ placeholder: 'How can I help you?', disabled: false })}
      actionSlot={renderSend({ disabled: false })}
    />
  ),
};

export const Disabled = {
  render: () => (
    <ComposerChrome
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
    <ComposerChrome
      inputSlot={renderInput({ placeholder: 'How can I help you?', disabled: false })}
    />
  ),
};
