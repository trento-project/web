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
  hostId: faker.datatype.uuid(),
  httpPort: faker.internet.port(),
  httpsPort: faker.internet.port(),
  instanceHostname: faker.hacker.noun(),
  instanceNumber: faker.datatype.number({ min: 10, max: 99 }).toString(),
  sid: faker.random.alpha({ casing: 'upper', count: 3 }),
  startPriority: faker.datatype.number({ min: 1, max: 9 }).toString(),
  sapSystemId: faker.datatype.uuid(),
}));

export const sapSystemFactory = Factory.define(({ params }) => {
  const sapSystemId = params.sapSystemId || faker.datatype.uuid();
  const sid = faker.random.alpha({ casing: 'upper', count: 3 });

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
    tenant: faker.random.alpha({ casing: 'upper', count: 3 }),
    hosts: hostFactory.buildList(5),
  };
});
