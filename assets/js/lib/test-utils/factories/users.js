import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { formatISO } from 'date-fns';

export const abilityFactory = Factory.define(() => ({
  id: faker.number.int(),
  name: faker.word.noun(),
  resource: faker.word.noun(),
  label: faker.hacker.phrase(),
}));

export const userFactory = Factory.define(() => ({
  id: faker.number.int(),
  username: faker.internet.username(),
  enabled: faker.datatype.boolean(),
  fullname: faker.internet.displayName(),
  email: faker.internet.email(),
  abilities: abilityFactory.buildList(2),
  password_change_requested_at: null,
  totp_enabled_at: formatISO(faker.date.past()),
  created_at: formatISO(faker.date.past()),
  updated_at: formatISO(faker.date.past()),
}));

export const profileFactory = Factory.define(() => ({
  id: faker.number.int(),
  username: faker.internet.username(),
  fullname: faker.internet.displayName(),
  email: faker.internet.email(),
  abilities: abilityFactory.buildList(2),
  password_change_requested: false,
  totp_enabled: faker.datatype.boolean(),
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

export const createUserRequestFactory = Factory.define(() => {
  const password = 'password';

  return {
    username: faker.internet.username().toLowerCase(),
    enabled: true,
    fullname: faker.internet.displayName(),
    email: faker.internet.email(),
    abilities: [],
    password,
    password_confirmation: password,
  };
});
