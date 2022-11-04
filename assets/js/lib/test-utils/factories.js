import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

const healthEnum = faker.helpers.arrayElement([
  'requested',
  'running',
  'not_running',
]);

export const checkFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  description: faker.lorem.paragraph(),
  executionState: healthEnum,
  health: healthEnum,
}));

export const healthSummaryFactory = Factory.define(() => ({
  clusterId: faker.datatype.uuid(),
  clustersHealth: healthEnum,
  databaseHealth: healthEnum,
  databaseId: faker.datatype.uuid(),
  hostsHealth: healthEnum,
  id: faker.datatype.uuid(),
  sapsystemHealth: healthEnum,
  SID: faker.random.alphaNumeric({
    length: 3,
    casing: 'upper',
  }),
}));
