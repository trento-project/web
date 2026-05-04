import Component from './SaptuneTuningState';

export default {
  title: 'Components/SaptuneTuningState',
  component: Component,
  argTypes: {
    state: {
      description: 'Saptune tuning state',
      control: { type: 'select' },
      options: ['compliant', 'not-compliant', 'pending', 'unknown'],
    },
  },
};

export const Default = {
  args: { state: 'compliant' },
};

export const NotCompliant = {
  args: { state: 'not-compliant' },
};

export const Pending = {
  args: { state: 'pending' },
};

export const Unknown = {
  args: { state: 'unknown' },
};
