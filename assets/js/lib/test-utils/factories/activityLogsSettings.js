import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const activityLogsSettingsFactory = Factory.define(() => ({
  retention_time: {
    value: faker.number.int({ min: 1, max: 30 }),
    unit: faker.helpers.arrayElement(['day', 'week', 'month', 'year']),
  },
}));
