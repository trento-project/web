import { faker } from '@faker-js/faker';
import CheckResultOverview from './ChecksResultOverview';

export default {
  title: 'CheckResultOverview',
  component: CheckResultOverview,
};

export const Default = {
  args: {
    data: {
      completed_at: faker.date.recent().toISOString(),
      passing_count: faker.datatype.number(),
      warning_count: faker.datatype.number(),
      critical_count: faker.datatype.number(),
    },
    error: false,
    loading: false,
    onCheckCLick: {},
  },
};

export const Loading = { args: { ...Default.args, loading: true } };
export const NoData = { ...Default.args, data: {} };
