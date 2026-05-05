import { faker } from '@faker-js/faker';
import { action } from 'storybook/actions';

import CheckResultsOverview from './CheckResultsOverview';

export default {
  title: 'Layouts/CheckResultsOverview',
  component: CheckResultsOverview,
  argTypes: {
    data: {
      description: 'Check results data object',
      control: { type: 'object' },
    },
    timezone: {
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
    },
    catalogDataEmpty: {
      description: 'Whether catalog data is empty',
      control: { type: 'boolean' },
    },
    error: {
      description: 'Error message to display',
      control: { type: 'text' },
    },
    loading: {
      description: 'Loading state',
      control: { type: 'boolean' },
    },
    onCheckClick: {
      action: 'onCheckClick',
      description: 'Callback when a check count is clicked',
    },
  },
};

export const Default = {
  args: {
    data: {
      completed_at: faker.date.recent().toISOString(),
      passing_count: faker.number.int(),
      warning_count: faker.number.int(),
      critical_count: faker.number.int(),
    },
    timezone: 'Etc/UTC',
    catalogDataEmpty: false,
    error: '',
    loading: false,
    onCheckClick: action('onCheckClick'),
  },
};

export const CatalogEmpty = {
  args: {
    ...Default.args,
    catalogDataEmpty: true,
  },
};

export const Loading = {
  args: {
    ...Default.args,
    loading: true,
  },
};

export const Error = {
  args: {
    ...Default.args,
    error: 'Network Error',
  },
};

export const NoData = {
  args: {
    ...Default.args,
    data: {},
  },
};
