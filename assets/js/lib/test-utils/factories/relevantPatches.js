import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const advisoryType = ['security_advisory', 'bugfix', 'enhancement'];

export const relevantPatchFactory = Factory.define(() => ({
  advisory_name: faker.animal.cat(),
  advisory_type: faker.helpers.arrayElement(advisoryType),
  advisory_status: 'stable',
  id: faker.number.int({ min: 2000, max: 5000 }),
  advisory_synopsis: faker.lorem.sentence(),
  date: faker.date.anytime(),
  update_date: faker.date.anytime(),
}));

export const patchForPackageFactory = Factory.define(() => ({
  advisory: faker.animal.cat(),
  type: faker.helpers.arrayElement(advisoryType),
  synopsis: faker.lorem.sentence(),
  issue_date: faker.date.anytime().toString(),
  update_date: faker.date.anytime().toString(),
  last_modified_date: faker.date.anytime().toString(),
}));
