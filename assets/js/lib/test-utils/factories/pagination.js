import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const paginationFirstPageFactory = Factory.define(() => ({
  first: faker.number.int({ min: 1, max: 20 }),
  last: null,
  start_cursor: faker.string.binary(),
  end_cursor: faker.string.binary(),
  has_next_page: true,
  has_previous_page: false,
}));
