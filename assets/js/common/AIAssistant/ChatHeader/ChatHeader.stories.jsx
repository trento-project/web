// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { action } from 'storybook/actions';
import { ChatHeaderView } from './ChatHeader';

export default {
  title: 'Components/AIAssistant/ChatHeader',
  component: ChatHeaderView,
  argTypes: {
    connectionStatus: {
      description: 'Current connection status of the AI assistant',
      options: ['connected', 'connecting', 'disconnected'],
      control: { type: 'radio' },
    },
    onNewChat: {
      description: 'Fired when the "New chat" button is clicked',
      type: 'function',
    },
    onClose: {
      description: 'Fired when the close button is clicked',
      type: 'function',
    },
  },
  args: {
    onNewChat: action('onNewChat'),
    onClose: action('onClose'),
  },
};

export const Connected = {
  args: { connectionStatus: 'connected' },
};

export const Connecting = {
  args: { connectionStatus: 'connecting' },
};

export const Disconnected = {
  args: { connectionStatus: 'disconnected' },
};
