/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const userFactory = Factory.define(() => ({
  id: faker.number.int(),
  username: faker.internet.userName(),
  created_at: faker.date.past(),
  actions: 'Delete',
  enabled: faker.datatype.boolean(),
  fullname: faker.internet.displayName(),
  email: faker.internet.email(),
}));

export const adminUser = userFactory.params({
  id: 1,
  username: 'admin',
  created_at: faker.date.past(),
  enabled: true,
  fullname: 'Trento Admin',
  email: 'admin@trento.suse.com',
});
