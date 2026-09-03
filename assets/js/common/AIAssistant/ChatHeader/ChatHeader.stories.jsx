// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { action } from 'storybook/actions';
import ChatHeader from './ChatHeader';

export default {
  title: 'Components/AIAssistant/ChatHeader',
  component: ChatHeader,
  argTypes: {
    connectionStatus: {
      description: 'Current connection status of the AI assistant',
      options: ['connected', 'connecting', 'disconnected'],
      control: { type: 'radio' },
    },
    isRunning: {
      description:
        'Whether a run is in flight — "New chat" is locked until it settles',
      control: { type: 'boolean' },
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

export const Running = {
  args: { connectionStatus: 'connected', isRunning: true },
};
