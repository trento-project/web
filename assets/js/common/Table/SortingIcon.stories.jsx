import Component from './SortingIcon';

export default {
  title: 'Components/SortingIcon',
  component: Component,
  argTypes: {
    sortable: {
      description: 'Whether the column is sortable',
      control: { type: 'boolean' },
    },
    sortDirection: {
      description: 'Current sort direction (asc, desc, or null)',
      control: { type: 'select' },
      options: ['asc', 'desc', null],
    },
  },
};

export const Default = {
  args: { sortable: true, sortDirection: null },
};

export const SortedAsc = {
  args: {
    ...Default.args,
    sortable: true,
    sortDirection: 'asc',
  },
};

export const SortedDesc = {
  args: {
    ...Default.args,
    sortable: true,
    sortDirection: 'desc',
  },
};

export const NotSortable = {
  args: {
    ...Default.args,
    sortable: false,
    sortDirection: null,
  },
};
