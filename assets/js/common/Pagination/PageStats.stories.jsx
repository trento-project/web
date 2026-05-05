import Pagination from '.';

export default {
  title: 'Components/PageStats',
  component: Pagination,
  argTypes: {
    currentItemsPerPage: {
      description: 'Number of items currently displayed per page',
      control: { type: 'number' },
    },
    itemsPresent: {
      description: 'Number of items currently present',
      control: { type: 'number' },
    },
    itemsTotal: {
      description: 'Total number of items',
      control: { type: 'number' },
    },
    selectedPage: {
      description: 'The currently selected page number',
      control: { type: 'number' },
    },
  },
};

export const Default = {
  args: {
    currentItemsPerPage: 10,
    itemsPresent: 5,
    itemsTotal: 50,
    selectedPage: 1,
  },
};
