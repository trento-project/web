import Component from './PageStats';

export default {
  title: 'Components/PageStats',
  component: Component,
  argTypes: {
    currentItemsPerPage: {
      description: 'The currentItemsPerPage prop',
      control: { type: 'number' },
    },
    itemsPresent: {
      description: 'Array of items for the itemsPresent',
      control: { type: 'object' },
    },
    itemsTotal: {
      description: 'Array of items for the itemsTotal',
      control: { type: 'object' },
    },
    selectedPage: {
      description: 'The selectedPage prop',
      control: { type: 'number' },
    },
  },
};

export const Default = {
  args: {
    currentItemsPerPage: '',
    itemsPresent: [],
    itemsTotal: [],
    selectedPage: '',
  },
};
