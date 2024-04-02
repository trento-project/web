/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { databaseInstanceFactory } from './databases';

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
  sid: faker.string.alphanumeric(3, { casing: 'upper' }),
  start_priority: faker.number.int({ min: 1, max: 9 }).toString(),
  sap_system_id: faker.string.uuid(),
  absent_at: null,
}));

export const sapSystemFactory = Factory.define(({ params }) => {
  const id = params.id || faker.string.uuid();
  const sid = params.sid || faker.string.alphanumeric(3, { casing: 'upper' });

  return {
    application_instances: sapSystemApplicationInstanceFactory.buildList(2, {
      sap_system_id: id,
      sid,
    }),
    database_instances: databaseInstanceFactory.buildList(2, {
      database_id: id,
      sid: faker.string.alphanumeric(3, { casing: 'upper' }),
    }),
    db_host: faker.internet.ip(),
    deregistered_at: null,
    ensa_version: ensaVersion(),
    health: healthEnum(),
    id,
    sid,
    tags: [],
    tenant: faker.string.alphanumeric(3, { casing: 'upper' }),
  };
});
