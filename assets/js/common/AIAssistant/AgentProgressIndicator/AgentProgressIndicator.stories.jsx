import { AgentProgressIndicatorView } from './AgentProgressIndicator';

export default {
  title: 'Components/AIAssistant/AgentProgressIndicator',
  component: AgentProgressIndicatorView,
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
