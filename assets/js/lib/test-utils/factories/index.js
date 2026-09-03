// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export * from './executions';
export * from './hosts';
export * from './sapSystems';
export * from './clusters';
export * from './databases';
export * from './relevantPatches';
export * from './advisoryErrata';
export * from './users';
export * from './checks';
export * from './upgradablePackage';
export * from './alertingSettings';
export * from './activityLog';
export * from './activityLogsSettings';
export * from './charts';
export * from './operations';
export * from './settings';
export * from './softwareUpdatesSettings';

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

// Sequential so that generated SIDs never repeat, base 36 to stay 3 characters
// long, and `S` prefixed so they never collide with the SIDs that tests
// hardcode as filter values.
// Output: S01 S02 … S0A … S0Z S10 … SZZ — 1295 distinct 3-char SIDs.
// Overflow past 1295 is harmless anyway:
// sequence 1296 renders S100 — 4 chars, still unique.
const sidFactory = Factory.define(
  ({ sequence }) => `S${sequence.toString(36).toUpperCase().padStart(2, '0')}`
);

export const generateSid = () => sidFactory.build();

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
  application_cluster_stale_at: null,
  application_health: healthEnum(),
  application_stale_at: null,
  database_health: healthEnum(),
  database_id: faker.string.uuid(),
  database_stale_at: null,
  database_cluster_id: faker.string.uuid(),
  database_cluster_health: healthEnum(),
  database_cluster_stale_at: null,
  hosts_health: healthEnum(),
  hosts_stale_at: null,
  id: faker.string.uuid(),
  sapsystem_health: healthEnum(),
  sid: generateSid(),
  tenant: generateSid(),
}));

export const aboutFactory = Factory.define(() => ({
  sles_subscriptions: faker.number.int(),
  version: faker.system.networkInterface(),
  wanda_version: faker.system.semver(),
  checks_version: faker.system.semver(),
  postgres_version: faker.system.semver(),
  rabbitmq_version: faker.system.semver(),
  prometheus_version: faker.system.semver(),
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
