import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { advisoryType } from './relevantPatches';

const buildFixes = (size) =>
  Object.fromEntries(
    new Array(size)
      .fill(0)
      .map(() => [
        faker.number.int({ min: 1, max: 65536 }),
        faker.lorem.sentence(),
      ])
  );

export const advisoryErrataFactory = Factory.define(() => ({
  fixes: buildFixes(faker.number.int({ min: 1, max: 4 })),
  errata_details: {
    id: faker.number.int({ min: 1, max: 65536 }),
    issue_date: faker.date.recent({ days: 30 }),
    update_date: faker.date.recent({ days: 30 }),
    last_modified_date: faker.date.recent({ days: 30 }),
    synopsis: faker.lorem.sentence(),
    release: faker.number.int({ min: 1, max: 256 }),
    advisory_status: 'stable',
    vendor_advisory: faker.lorem.word(),
    type: faker.helpers.arrayElement(advisoryType),
    product: faker.internet.userName(),
    errata_from: faker.lorem.word(),
    topic: faker.animal.cat(),
    description: faker.lorem.sentence(),
    references: faker.lorem.sentence(),
    notes: faker.lorem.sentence(),
    solution: faker.lorem.sentence(),
    reboot_suggested: faker.datatype.boolean(),
    restart_suggested: faker.datatype.boolean(),
  },
}));
