import Component from './EmptyState';

export default {
  title: 'Components/EmptyState',
  component: Component,
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
  args: { colSpan: '', emptyStateText: '' },
};
