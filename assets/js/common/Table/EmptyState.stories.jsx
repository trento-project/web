import Table from '.';

export default {
  title: 'Components/EmptyState',
  component: Table,
  argTypes: {
    colSpan: {
      description: 'The colSpan prop',
      control: { type: 'number' },
    },
    emptyStateText: {
      description: 'The emptyStateText prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    colSpan: 5,
    emptyStateText: 'No data available',
  },
};
