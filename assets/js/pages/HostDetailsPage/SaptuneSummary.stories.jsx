import { action } from 'storybook/actions';

import SaptuneSummary from './SaptuneSummary';

export default {
  title: 'Components/SaptuneSummary',
  component: SaptuneSummary,
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
    sapPresent: true,
    saptuneVersion: '7.3.0',
    saptuneConfiguredVersion: '7.3.0',
    saptuneTuning: 'HANA',
    onViewDetails: action('onViewDetails'),
  },
};
