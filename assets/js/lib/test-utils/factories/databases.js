import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { generateSid } from '.';

const healthEnum = () =>
  faker.helpers.arrayElement(['passing', 'critical', 'warning', 'unknown']);
const features = () =>
  faker.helpers.arrayElements(['HDB', 'HDB_WORKER', 'HDB_STANDBY']);

export const databaseInstanceFactory = Factory.define(() => ({
  database_id: faker.string.uuid(),
  health: healthEnum(),
  host_id: faker.string.uuid(),
  http_port: faker.internet.port(),
  https_port: faker.internet.port(),
  instance_hostname: faker.hacker.noun(),
  instance_number: faker.number.int({ min: 10, max: 99 }).toString(),
  sid: generateSid(),
  features: features().join('|'),
  start_priority: faker.number.int({ min: 1, max: 9 }).toString(),
  system_replication: '',
  system_replication_status: '',
  system_replication_site: '',
  system_replication_mode: '',
  system_replication_operation_mode: '',
  system_replication_source_site: '',
  system_replication_tier: 0,
  absent_at: null,
}));

export const databaseFactory = Factory.define(({ params }) => {
  const id = params.id || faker.string.uuid();
  const sid = generateSid();

  return {
    id,
    sid,
    health: healthEnum(),
    database_instances: databaseInstanceFactory.buildList(2, {
      database_id: id,
      sid,
    }),
  };
});
