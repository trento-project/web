import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

// Ported values from ${PROJECT_ROOT}/lib/trento/software_updates/enums/advisory_type.ex
const advisoryType = ['security_advisory', 'bugfix', 'enhancement'];

// Ported version of relevant_patch_factory in ${PROJECT_ROOT}/test/support/factory.ex
export const relevantPatchFactory = Factory.define(() => ({
  advisory_name: faker.animal.cat(),
  advisory_type: faker.helpers.arrayElement(advisoryType),
  advisory_status: 'stable',
  id: faker.number.int({ min: 2000, max: 5000 }),
  advisory_synopsis: faker.lorem.sentence(),
  date: faker.date.anytime(),
  update_date: faker.date.anytime(),
}));
