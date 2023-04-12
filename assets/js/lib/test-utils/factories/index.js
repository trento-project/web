/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export * from './executions';
export * from './hosts';
export * from './sapSystems';
export * from './clusters';
export * from './databases';

export const randomObjectFactory = Factory.define(({ transientParams }) => {
  const depth = transientParams.depth || 2;
  const length = faker.datatype.number({ min: 3, max: 10 });

  const lastElement =
    depth === 1
      ? { key: faker.hacker.noun(), value: faker.name.firstName() }
      : {
          key: faker.hacker.noun(),
          value: randomObjectFactory.build(
            {},
            { transient: { depth: depth - 1 } }
          ),
        };

  return Array.from({ length: length - 1 }, () => ({
    key: faker.hacker.noun(),
    value: faker.hacker.adjective(),
  }))
    .concat([lastElement])
    .reduce(
      (accumulator, { key, value }) => ({
        ...accumulator,
        [key]: value,
      }),
      {}
    );
});

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

export const catalogExpectExpectationFactory = Factory.define(() => ({
  name: faker.animal.cat(),
  type: 'expect',
  expression: faker.lorem.sentence(),
}));

export const catalogExpectSameExpectationFactory = Factory.define(() => ({
  name: faker.animal.cat(),
  type: 'expect_same',
  expression: faker.lorem.sentence(),
}));

export const catalogCheckFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  name: faker.animal.cat(),
  group: faker.animal.cat(),
  description: faker.lorem.paragraph(),
  remediation: faker.lorem.paragraph(),
  premium: faker.datatype.boolean(),
  expectations: catalogExpectExpectationFactory.buildList(3),
}));

export const catalogFactory = Factory.define(() => ({
  loading: faker.datatype.boolean(),
  catalog: catalogCheckFactory.build(),
  error: null,
}));

export const aboutFactory = Factory.define(() => ({
  flavor: faker.animal.cat(),
  sles_subscriptions: faker.datatype.number(),
  version: faker.system.networkInterface(),
}));

export const objectTreeFactory = Factory.define(() => ({
  number: faker.datatype.number(),
  string: faker.word.adjective(),
  array: faker.datatype.array(),
  complexObject: {
    nestedNumber: faker.datatype.number(),
    nestedString: faker.word.noun(),
  },
}));
