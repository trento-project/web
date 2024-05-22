import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

const advisoryType = ['security_advisory', 'bugfix', 'enhancement'];

export const relevantPatchFactory = Factory.define(() => ({
  advisory_name: faker.animal.cat(),
  advisory_type: faker.helpers.arrayElement(advisoryType),
  advisory_status: 'stable',
  id: faker.number.int({ min: 2000, max: 5000 }),
  advisory_synopsis: faker.lorem.sentence(),
  date: faker.date.anytime(),
  update_date: faker.date.anytime(),
}));
