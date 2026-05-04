import CheckResultCount from './CheckResultCount';

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

export const Passing = {
  args: {
    value: 42,
    result: 'passing',
  },
};

export const Warning = {
  args: {
    value: 7,
    result: 'warning',
  },
};

export const Critical = {
  args: {
    value: 2,
    result: 'critical',
  },
};
