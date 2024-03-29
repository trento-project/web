import { faker } from '@faker-js/faker';
import CheckResultsOverview from './CheckResultsOverview';

export default {
  title: 'Layouts/CheckResultsOverview',
  component: CheckResultsOverview,
};

export const Default = {
  args: {
    data: {
      completed_at: faker.date.recent().toISOString(),
      passing_count: faker.number.int(),
      warning_count: faker.number.int(),
      critical_count: faker.number.int(),
    },
    catalogDataEmpty: false,
    error: '',
    loading: false,
    onCheckClick: () => {},
  },
};

export const CatalogEmpty = {
  args: { ...Default.args, catalogDataEmpty: true },
};
export const Loading = { args: { ...Default.args, loading: true } };
export const Error = { args: { ...Default.args, error: 'Network Error' } };
export const NoData = { ...Default.args, data: {} };
