import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const checkFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  description: faker.lorem.paragraph(),
  executionState: faker.helpers.arrayElement([
    'requested',
    'running',
    'not_running',
  ]),
  health: faker.helpers.arrayElement([
    'passing',
    'warning',
    'critical',
    'unknown',
  ]),
}));
