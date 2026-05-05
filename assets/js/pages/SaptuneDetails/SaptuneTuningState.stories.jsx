import SaptuneTuningState from './SaptuneTuningState';

export default {
  title: 'Components/SaptuneTuningState',
  component: SaptuneTuningState,
  argTypes: {
    state: {
      description: 'Saptune tuning state',
      control: { type: 'select' },
      options: ['compliant', 'not-compliant', 'pending', 'unknown'],
    },
  },
};

export const Default = {
  args: {
    state: 'compliant',
  },
};

export const NotCompliant = {
  args: {
    ...Default.args,
    state: 'not-compliant',
  },
};

export const Pending = {
  args: {
    ...Default.args,
    state: 'pending',
  },
};

export const Unknown = {
  args: {
    ...Default.args,
    state: 'unknown',
  },
};
