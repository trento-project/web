/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export * from './executions';
export * from './hosts';
export * from './sapSystems';

const healthEnum = () =>
  faker.helpers.arrayElement(['requested', 'running', 'not_running']);

export const resultEnum = () =>
  faker.helpers.arrayElement(['passing', 'critical', 'warning']);

export const checkFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  description: faker.lorem.paragraph(),
  executionState: healthEnum,
  health: healthEnum,
}));

export const healthSummaryFactory = Factory.define(() => ({
  clusterId: faker.datatype.uuid(),
  clustersHealth: healthEnum(),
  databaseHealth: healthEnum(),
  databaseId: faker.datatype.uuid(),
  hostsHealth: healthEnum(),
  id: faker.datatype.uuid(),
  sapsystemHealth: healthEnum(),
  sid: faker.random.alphaNumeric({
    length: 3,
    casing: 'upper',
  }),
}));

export const catalogCheckFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  name: faker.animal.cat(),
  group: faker.animal.cat(),
  description: faker.lorem.paragraph(),
  remediation: faker.lorem.paragraph(),
}));

export const catalogFactory = Factory.define(() => ({
  loading: faker.datatype.boolean(),
  catalog: catalogCheckFactory.build(),
  error: null,
}));

export const hostnameFactory = Factory.define(({ sequence }) => ({
  id: faker.datatype.uuid(),
  hostname: `${faker.hacker.noun()}_${sequence}`,
}));

export const aboutFactory = Factory.define(() => ({
  flavor: faker.animal.cat(),
  sles_subscriptions: faker.datatype.number(),
  version: faker.system.networkInterface(),
}));

export const clusterFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  selected_checks: [],
}));
