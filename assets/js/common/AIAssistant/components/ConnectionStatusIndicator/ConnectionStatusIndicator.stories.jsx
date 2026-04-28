import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';

export default {
  title: 'Components/AIAssistant/ConnectionStatusIndicator',
  component: ConnectionStatusIndicator,
  argTypes: {
    status: {
      description: 'Current connection status of the AI assistant',
      options: ['connected', 'connecting', 'disconnected'],
      control: { type: 'radio' },
    },
    className: {
      description: 'Additional CSS classes for the wrapper',
      control: { type: 'text' },
    },
  },
};

export const Connected = {
  args: { status: 'connected' },
};

export const Connecting = {
  args: { status: 'connecting' },
};

export const Disconnected = {
  args: { status: 'disconnected' },
};
