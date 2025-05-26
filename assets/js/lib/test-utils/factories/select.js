import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const normalizedOptionsFactory = Factory.define(() => ({
  value: faker.string.uuid(),
  disabled: faker.datatype.boolean(),
  key: faker.string.uuid(),
}));
