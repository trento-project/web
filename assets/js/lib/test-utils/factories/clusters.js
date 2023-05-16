/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { resultEnum } from '.';

const clusterTypeEnum = () =>
  faker.helpers.arrayElement(['unknown', 'hana_scale_up']);

export const clusterFactory = Factory.define(({ sequence }) => ({
  id: faker.datatype.uuid(),
  name: `${faker.name.firstName()}_${sequence}`,
  sid: faker.random.alphaNumeric(3, { casing: 'upper' }),
  additional_sids: [],
  hosts_number: faker.datatype.number(),
  resources_number: faker.datatype.number(),
  type: clusterTypeEnum(),
  health: resultEnum(),
  selected_checks: [],
}));
