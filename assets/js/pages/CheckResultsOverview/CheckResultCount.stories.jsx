import CheckResultCount from './CheckResultCount';

import { action } from 'storybook/actions';
export default {
  title: 'Layouts/CheckResultsOverview/CheckResultCount',
  component: CheckResultCount,
  argTypes: {
    value: {
      description: 'Numeric count to display',
      control: { type: 'number' },
    },
    result: {
      description: 'Result type to display (affects icon/color)',
      control: { type: 'select' },
      options: ['passing', 'warning', 'critical'],
    },
    onClick: {
      action: 'onClick',
      description: 'Click handler when the row is clicked',
    },
  },
};

export const Default = {
  args: {
    value: 0,
    result: 'passing',
    onClick: action('onClick'),
  },
};

export const Passing = {
  args: {
    ...Default.args,
    value: 42,
    result: 'passing',
    onClick: action('onClick'),
  },
};

export const Warning = {
  args: {
    ...Default.args,
    value: 7,
    result: 'warning',
    onClick: action('onClick'),
  },
};

export const Critical = {
  args: {
    ...Default.args,
    value: 2,
    result: 'critical',
    onClick: action('onClick'),
  },
};
