import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { EXPECT, EXPECT_ENUM, EXPECT_SAME } from '@lib/model';

export * from './executions';
export * from './hosts';
export * from './sapSystems';
export * from './clusters';
export * from './databases';
export * from './relevantPatches';
export * from './advisoryErrata';

export const randomObjectFactory = Factory.define(({ transientParams }) => {
  const depth = transientParams.depth || 2;
  const length = faker.number.int({ min: 3, max: 10 });

  const lastElement =
    depth === 1
      ? { key: faker.hacker.noun(), value: faker.person.firstName() }
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

export const generateSid = () =>
  faker.string.alphanumeric({ casing: 'upper', length: 3 });

const executionStateEnum = () =>
  faker.helpers.arrayElement(['requested', 'running', 'not_running']);

export const healthEnum = () =>
  faker.helpers.arrayElement(['passing', 'critical', 'warning', 'unknown']);

export const checkFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  description: faker.lorem.paragraph(),
  executionState: executionStateEnum,
  health: healthEnum,
}));

export const healthSummaryFactory = Factory.define(() => ({
  application_cluster_id: faker.string.uuid(),
  application_cluster_health: healthEnum(),
  database_health: healthEnum(),
  database_id: faker.string.uuid(),
  database_cluster_id: faker.string.uuid(),
  database_cluster_health: healthEnum(),
  hosts_health: healthEnum(),
  id: faker.string.uuid(),
  sapsystem_health: healthEnum(),
  sid: generateSid(),
  tenant: generateSid(),
}));

export const catalogExpectExpectationFactory = Factory.define(
  ({ sequence }) => ({
    name: `${faker.lorem.word()}_${sequence}`,
    type: EXPECT,
    expression: faker.lorem.sentence(),
  })
);

export const catalogExpectSameExpectationFactory = Factory.define(
  ({ sequence }) => ({
    name: `${faker.lorem.word()}_${sequence}`,
    type: EXPECT_SAME,
    expression: faker.lorem.sentence(),
  })
);

export const catalogExpectEnumExpectationFactory = Factory.define(
  ({ sequence }) => ({
    name: `${faker.lorem.word()}_${sequence}`,
    type: EXPECT_ENUM,
    expression: faker.lorem.sentence(),
  })
);

export const catalogCheckFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  name: faker.animal.cat(),
  group: faker.animal.cat(),
  description: faker.lorem.paragraph(),
  remediation: faker.lorem.paragraph(),
  premium: faker.datatype.boolean(),
  metadata: null,
  expectations: catalogExpectExpectationFactory.buildList(3),
}));

export const catalogFactory = Factory.define(() => ({
  loading: faker.datatype.boolean(),
  catalog: catalogCheckFactory.build(),
  error: null,
}));

export const aboutFactory = Factory.define(() => ({
  flavor: faker.animal.cat(),
  sles_subscriptions: faker.number.int(),
  version: faker.system.networkInterface(),
}));

export const objectTreeFactory = Factory.define(() => ({
  number: faker.number.int(),
  string: faker.word.adjective(),
  array: [faker.lorem.word(4), faker.lorem.word(5), faker.lorem.word(6)],
  complexObject: {
    nestedNumber: faker.number.int(),
    nestedString: faker.word.noun(),
  },
  null: null,
}));
