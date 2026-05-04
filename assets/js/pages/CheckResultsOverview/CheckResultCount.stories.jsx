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

export const Default = {
  args: {
    value: 0,
    result: 'passing',
    onClick: () => {},
  },
};

export const Passing = {
  args: {
    value: 42,
    result: 'passing',
    onClick: () => {},
  },
};

export const Warning = {
  args: {
    value: 7,
    result: 'warning',
    onClick: () => {},
  },
};

export const Critical = {
  args: {
    value: 2,
    result: 'critical',
    onClick: () => {},
  },
};
