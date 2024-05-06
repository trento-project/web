import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { formatISO } from 'date-fns';

export const userFactory = Factory.define(() => ({
  id: faker.number.int(),
  username: faker.internet.userName(),
  actions: 'Delete',
  enabled: faker.datatype.boolean(),
  fullname: faker.internet.displayName(),
  email: faker.internet.email(),
  created_at: formatISO(faker.date.past()),
  updated_at: formatISO(faker.date.past()),
}));

export const adminUser = userFactory.params({
  id: 1,
  username: 'admin',
  created_at: formatISO(faker.date.past()),
  enabled: true,
  fullname: 'Trento Admin',
  email: 'admin@trento.suse.com',
});
