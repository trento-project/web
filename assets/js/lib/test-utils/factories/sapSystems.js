import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { databaseInstanceFactory, generateSid } from '.';

const ensaVersion = () =>
  faker.helpers.arrayElement(['no_ensa', 'ensa1', 'ensa2']);
const healthEnum = () =>
  faker.helpers.arrayElement(['passing', 'critical', 'warning', 'unknown']);
const roles = () =>
  faker.helpers.arrayElements([
    'MESSAGESERVER',
    'ENQUE',
    'ABAP',
    'GATEWAY',
    'ICMAN',
    'IGS',
  ]);

export const sapSystemApplicationInstanceFactory = Factory.define(() => ({
  features: roles().join('|'),
  health: healthEnum(),
  host_id: faker.string.uuid(),
  http_port: faker.internet.port(),
  https_port: faker.internet.port(),
  instance_hostname: faker.hacker.noun(),
  instance_number: faker.number.int({ min: 10, max: 99 }).toString(),
  sid: generateSid(),
  start_priority: faker.number.int({ min: 1, max: 9 }).toString(),
  sap_system_id: faker.string.uuid(),
  absent_at: null,
}));

export const sapSystemFactory = Factory.define(({ params }) => {
  const id = params.id || faker.string.uuid();
  const sid = params.sid || generateSid();
  const databaseId = params.database_id || faker.string.uuid();
  const databaseSid = params.database_sid || generateSid();
  const sapSystemType = params.sap_system_type || 'ABAP';
  return {
    application_instances: sapSystemApplicationInstanceFactory.buildList(2, {
      sap_system_id: id,
      sid,
      features: sapSystemType,
    }),
    database_instances: databaseInstanceFactory.buildList(2, {
      database_id: databaseId,
      sid: databaseSid,
    }),
    db_host: faker.internet.ip(),
    deregistered_at: null,
    ensa_version: ensaVersion(),
    health: healthEnum(),
    id,
    sid,
    tags: [],
    database_sid: databaseSid,
    tenant: databaseSid,
    database_id: databaseId,
  };
});
