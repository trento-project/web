/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

const healthEnum = () =>
  faker.helpers.arrayElement(['passing', 'critical', 'warning', 'unknown']);
const features = () =>
  faker.helpers.arrayElements(['HDB', 'HDB_WORKER', 'HDB_STANDBY']);

export const databaseInstanceFactory = Factory.define(() => ({
  sap_system_id: faker.datatype.uuid(),
  health: healthEnum(),
  host_id: faker.datatype.uuid(),
  http_port: faker.internet.port(),
  https_port: faker.internet.port(),
  instance_hostname: faker.hacker.noun(),
  instance_number: faker.datatype.number({ min: 10, max: 99 }).toString(),
  sid: faker.random.alpha({ casing: 'upper', count: 3 }),
  features: features().join('|'),
  start_priority: faker.datatype.number({ min: 1, max: 9 }).toString(),
  system_replication: '',
  system_replication_status: '',
  absent_at: null,
}));

export const databaseFactory = Factory.define(({ params }) => {
  const id = params.id || faker.datatype.uuid();
  const sid = faker.random.alpha({ casing: 'upper', count: 3 });

  return {
    id,
    sid,
    health: healthEnum(),
    database_instances: databaseInstanceFactory.buildList(2, {
      sap_system_id: id,
      sid,
    }),
  };
});
