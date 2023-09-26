import { faker } from '@faker-js/faker';
import ChecksResultOverview from './ChecksResultOverview';

export default {
  title: 'ChecksResultOverview',
  component: ChecksResultOverview,
};

export const Default = {
  args: {
    data: {
      completed_at: faker.date.recent().toISOString(),
      passing_count: faker.number.int(),
      warning_count: faker.number.int(),
      critical_count: faker.number.int(),
    },
    error: '',
    loading: false,
    onCheckClick: () => {},
  },
};

export const Loading = { args: { ...Default.args, loading: true } };
export const Error = { args: { ...Default.args, error: 'Network Error' } };
export const NoData = { ...Default.args, data: {} };
