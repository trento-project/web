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
  host_id: faker.datatype.uuid(),
  http_port: faker.internet.port(),
  https_port: faker.internet.port(),
  instance_hostname: faker.hacker.noun(),
  instance_number: faker.datatype.number({ min: 10, max: 99 }).toString(),
  sid: faker.random.alphaNumeric(3, { casing: 'upper' }),
  start_priority: faker.datatype.number({ min: 1, max: 9 }).toString(),
  sap_system_id: faker.datatype.uuid(),
}));

export const sapSystemFactory = Factory.define(({ params }) => {
  const sapSystemID = params.sapSystemId || faker.datatype.uuid();
  const sid = params.sid || faker.random.alphaNumeric(3, { casing: 'upper' });

  return {
    application_instances: sapSystemApplicationInstanceFactory.buildList(2, {
      sap_system_id: sapSystemID,
      sid,
    }),
    database_instances: databaseInstanceFactory.buildList(2, {
      sap_system_id: sapSystemID,
      sid: faker.random.alphaNumeric(3, { casing: 'upper' }),
    }),
    db_host: faker.internet.ip(),
    deregistered_at: null,
    ensa_version: ensaVersion(),
    health: healthEnum(),
    id: sapSystemID,
    sid,
    tags: [],
    tenant: faker.random.alphaNumeric(3, { casing: 'upper' }),
  };
});
