import Component from './SaptuneSummary';

export default {
  title: 'Components/SaptuneSummary',
  component: Component,
  argTypes: {
    sapPresent: {
      description: 'The sapPresent prop',
      control: { type: 'text' },
    },
    onViewDetails: {
      description: 'Callback function invoked when view details',
      action: 'onViewDetails',
    },
    saptuneVersion: {
      description: 'The saptuneVersion prop',
      control: { type: 'text' },
    },
    saptuneConfiguredVersion: {
      description: 'The saptuneConfiguredVersion prop',
      control: { type: 'text' },
    },
    saptuneTuning: {
      description: 'The saptuneTuning prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    sapPresent: '',
    saptuneVersion: '',
    saptuneConfiguredVersion: '',
    saptuneTuning: '',
  },
};
