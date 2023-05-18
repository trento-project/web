/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import day from 'dayjs';

import { resultEnum, cloudProviderEnum } from '.';

const clusterTypeEnum = () =>
  faker.helpers.arrayElement(['unknown', 'hana_scale_up']);

const hanaStatus = () => faker.helpers.arrayElement(['Primary', 'Failed']);

export const clusterResourceFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  role: faker.animal.bear(),
  status: faker.animal.bird(),
  type: faker.animal.cat(),
  fail_count: faker.datatype.number(),
}));

export const clusterDetailsNodesFactory = Factory.define(() => ({
  name: faker.animal.dog(),
  site: faker.address.city(),
  virtual_ip: faker.internet.ip(),
  hana_status: hanaStatus(),
  attributes: Array.from({ length: 5 }).reduce(
    (acc, _) => ({
      ...acc,
      ...{ [faker.animal.cat()]: faker.animal.dog() },
    }),
    {}
  ),
  resources: clusterResourceFactory.buildList(5),
}));

export const sbdDevicesFactory = Factory.define(() => ({
  device: faker.system.filePath(),
  status: faker.helpers.arrayElement(['healthy', 'unhealthy']),
}));

export const clusterFactory = Factory.define(({ sequence }) => ({
  id: faker.datatype.uuid(),
  name: `${faker.name.firstName()}_${sequence}`,
  sid: faker.random.alphaNumeric(3, { casing: 'upper' }),
  hosts_number: faker.datatype.number(),
  resources_number: faker.datatype.number(),
  type: clusterTypeEnum(),
  health: resultEnum(),
  selected_checks: [],
  provider: cloudProviderEnum(),
  cib_last_written: day(faker.date.recent()).format(),
  details: {
    fencing_type: 'external/sbd',
    nodes: clusterDetailsNodesFactory.buildList(2),
    sbd_devices: sbdDevicesFactory.buildList(3),
    secondary_sync_state: 'SOK',
    sr_health_state: '4',
    stopped_resources: clusterResourceFactory.buildList(2),
    system_replication_mode: 'sync',
    system_replication_operation_mode: 'logreplay',
  },
}));
