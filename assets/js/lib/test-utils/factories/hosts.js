/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import day from 'dayjs';

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

export const saptuneStatusFactory = Factory.define(() => ({
  package_version: faker.helpers.fake(
    '{{number.int}}.{{number.int}}.{{number.int}}'
  ),
  configured_version: faker.number.int(),
  tuning_state: saptuneTuningStateEnum(),
}));

export const hostFactory = Factory.define(({ params, sequence }) => {
  const id = params.id || faker.string.uuid();

  return {
    id,
    agent_version: '1.1.0+git.dev17.1660137228.fe5ba8a',
    hostname: `${faker.person.firstName()}_${sequence}`,
    cluster_id: faker.string.uuid(),
    ip_addresses: [faker.internet.ip()],
    provider: cloudProviderEnum(),
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
