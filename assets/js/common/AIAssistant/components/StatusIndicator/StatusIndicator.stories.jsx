import { StatusIndicator } from './StatusIndicator';

export default {
  title: 'Components/AIAssistant/StatusIndicator',
  component: StatusIndicator,
  argTypes: {
    label: {
      description: 'Label rendered next to the spinner',
      control: { type: 'text' },
    },
  },
};

export const Thinking = {
  args: { label: 'Thinking...' },
};

export const CallingTool = {
  args: { label: 'Calling get_hosts...' },
};

export const PreparingResponse = {
  args: { label: 'Preparing response...' },
};
