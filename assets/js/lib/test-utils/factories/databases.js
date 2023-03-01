/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

const healthEnum = () => faker.helpers.arrayElement(['passing', 'critical']);

export const databaseInstanceFactory = Factory.define(() => ({
  sap_system_id: faker.datatype.uuid(),
  sid: faker.random.alpha({ casing: 'upper', count: 3 }),
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
