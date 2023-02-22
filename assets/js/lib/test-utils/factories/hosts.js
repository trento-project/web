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

const cloudProviderEnum = () =>
  faker.helpers.arrayElement(['azure', 'aws', 'gcp', 'nutanix']);

const heartbeatEnum = () =>
  faker.helpers.arrayElement(['unknown', 'critical', 'passing']);

export const slesSubscriptionFactory = Factory.define(() => ({
  arch: 'x86_64',
  expires_at: day(faker.date.future()).format(slesSubscriptionDateFormat),
  host_id: faker.datatype.uuid(),
  identifier: slesSubscriptionIdentifierEnum(),
  inserted_at: day(faker.date.recent()).format(),
  starts_at: day(faker.date.past()).format(slesSubscriptionDateFormat),
  status: 'Registered',
  subscription_status: 'ACTIVE',
  type: 'internal',
  updated_at: day(faker.date.recent()).format(),
  version: '15.3',
}));

export const hostFactory = Factory.define(({ params }) => {
  const id = params.id || faker.datatype.uuid();

  return {
    id,
    agent_version: '1.1.0+git.dev17.1660137228.fe5ba8a',
    hostname: faker.name.firstName(),
    cluster_id: faker.datatype.uuid(),
    ip_addresses: [faker.internet.ip()],
    provider: cloudProviderEnum(),
    heartbeat: heartbeatEnum(),
    provider_data: {
      admin_username: faker.name.firstName().toLowerCase(),
      data_disk_number: faker.datatype.number({ min: 1, max: 9 }),
      location: faker.word.noun(),
      offer: 'sles-sap-15-sp3-byos',
      resource_group: faker.word.noun(),
      sku: faker.word.noun(),
      vm_name: faker.hacker.noun(),
      vm_size: faker.hacker.noun(),
    },
    sles_subscriptions: slesSubscriptionFactory.buildList(4, { host_id: id }),
  };
});
