/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { hostFactory } from './hosts';

const healthEnum = () => faker.helpers.arrayElement(['passing', 'critical']);
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
  const sapSystemId = params.sapSystemId || faker.datatype.uuid();
  const sid = faker.random.alphaNumeric(3, { casing: 'upper' });

  return {
    dbHost: faker.internet.ip(),
    health: healthEnum(),
    id: sapSystemId,
    instances: sapSystemApplicationInstanceFactory.buildList(2, {
      sapSystemId,
      sid,
    }),
    sid,
    tags: [],
    tenant: faker.random.alphaNumeric(3, { casing: 'upper' }),
    hosts: hostFactory.buildList(5),
    ensa_version: 'ensa1',
  };
});
