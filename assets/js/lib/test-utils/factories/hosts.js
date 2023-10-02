/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import day from 'dayjs';
import { times } from 'lodash';

import { healthEnum } from '.';

const slesSubscriptionDateFormat = 'YYYY-MM-DD HH:mm:ss UTC';

const slesSubscriptionIdentifierEnum = () =>
  faker.helpers.arrayElement([
    'sle-module-sap-applications',
    'sle-module-public-cloud',
    'sle-module-desktop-applications',
    'sle-module-basesystem',
    'sle-ha',
  ]);

export const cloudProviderEnum = () =>
  faker.helpers.arrayElement(['azure', 'aws', 'gcp', 'nutanix']);

const heartbeatEnum = () =>
  faker.helpers.arrayElement(['unknown', 'critical', 'passing']);

const saptuneTuningStateEnum = () =>
  faker.helpers.arrayElement(['compliant', 'not compliant', 'no tuning']);

export const slesSubscriptionFactory = Factory.define(() => ({
  arch: 'x86_64',
  expires_at: day(faker.date.future()).format(slesSubscriptionDateFormat),
  host_id: faker.string.uuid(),
  identifier: slesSubscriptionIdentifierEnum(),
  inserted_at: day(faker.date.recent()).format(),
  starts_at: day(faker.date.past()).format(slesSubscriptionDateFormat),
  status: 'Registered',
  subscription_status: 'ACTIVE',
  type: 'internal',
  updated_at: day(faker.date.recent()).format(),
  version: '15.3',
}));

const sapNoteID = () =>
  faker.number.int({ min: 100000, max: 999999 }).toString();

const sapNotesList = (count = 6) => times(count, sapNoteID);

const saptuneServiceEnabledEnum = () =>
  faker.helpers.arrayElement(['enabled', 'disabled', null]);

const saptuneServiceActiveEnum = () =>
  faker.helpers.arrayElement(['active', 'inactive', null]);

const saptuneServiceNameEnum = () =>
  faker.helpers.arrayElement(['tuned', 'sapconf', 'saptune']);

const saptuneSolutionNameEnum = () =>
  faker.helpers.arrayElement(['NETWEAVER', 'HANA', 'NETWEAVER+HANA']);

const saptuneServiceFactory = Factory.define(() => ({
  active: saptuneServiceActiveEnum(),
  enabled: saptuneServiceEnabledEnum(),
  name: saptuneServiceNameEnum(),
}));

export const saptuneStagingFactory = Factory.define(() => ({
  enabled: faker.datatype.boolean(),
  notes: sapNotesList(3),
  solutions_ids: [saptuneSolutionNameEnum()],
}));

export const saptuneNoteFactory = Factory.define(() => ({
  additionally_enabled: faker.datatype.boolean(),
  id: sapNoteID(),
}));

export const saptuneSolutionFactory = Factory.define(() => ({
  id: saptuneSolutionNameEnum(),
  notes: sapNotesList(),
  partial: faker.datatype.boolean(),
}));

export const saptuneStatusFactory = Factory.define(() => {
  const solution = saptuneSolutionFactory.build();
  const { notes } = solution;
  const allNotes = notes.map((id) => saptuneNoteFactory.build({ id }));

  return {
    applied_notes: allNotes,
    applied_solution: solution,
    configured_version: faker.number.int({ min: 1, max: 3 }),
    enabled_notes: allNotes,
    enabled_solution: solution,
    package_version: faker.system.semver(),
    services: [
      saptuneServiceFactory.build({ name: 'sapconf' }),
      saptuneServiceFactory.build({ name: 'saptune' }),
      saptuneServiceFactory.build({ name: 'tuned' }),
    ],
    staging: saptuneStagingFactory.build(3),
    tuning_state: saptuneTuningStateEnum(),
  };
});
export const hostFactory = Factory.define(({ params, sequence }) => {
  const id = params.id || faker.string.uuid();

  return {
    id,
    agent_version: '1.1.0+git.dev17.1660137228.fe5ba8a',
    hostname: `${faker.person.firstName()}_${sequence}`,
    cluster_id: faker.string.uuid(),
    ip_addresses: [faker.internet.ip()],
    provider: cloudProviderEnum(),
    health: healthEnum(),
    heartbeat: heartbeatEnum(),
    provider_data: {
      admin_username: faker.person.firstName().toLowerCase(),
      data_disk_number: faker.number.int({ min: 1, max: 9 }),
      location: faker.word.noun(),
      offer: 'sles-sap-15-sp3-byos',
      resource_group: faker.word.noun(),
      sku: faker.word.noun(),
      vm_name: faker.hacker.noun(),
      vm_size: faker.hacker.noun(),
    },
    sles_subscriptions: slesSubscriptionFactory.buildList(4, { host_id: id }),
    deregisterable: false,
    selected_checks: [],
    saptune_status: saptuneStatusFactory.build(),
  };
});
