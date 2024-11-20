import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { advisoryType } from './relevantPatches';

const affectedPackageFactory = Factory.define(({ sequence }) => ({
  name: `${faker.animal.cat().toLowerCase()}${sequence}`,
  arch_label: faker.helpers.arrayElement(['x86_64', 'i586', 'aarch64']),
  version: faker.system.semver(),
  release: `${faker.number.int({ min: 0, max: 100 })}`,
  epoch: `${faker.number.int({ min: 0, max: 50 })}`,
}));

const affectedSystemFactory = Factory.define(({ sequence }) => ({
  name: `${faker.string.uuid()}-${sequence}`,
}));

const fixMapFactory = Factory.define(({ transientParams }) => {
  const { length = 1 } = transientParams;

  return Object.fromEntries(
    new Array(length)
      .fill(0)
      .map(() => [
        faker.number.int({ min: 1, max: 65536 }),
        faker.lorem.sentence(),
      ])
  );
});

export const cveFactory = Factory.define(
  () =>
    `CVE-${faker.number.int({ min: 1991, max: 2024 })}-${faker.number.int({
      min: 0,
      max: 9999,
    })}`
);

export const advisoryErrataFactory = Factory.define(({ params }) => ({
  fixes:
    params.fixes ||
    fixMapFactory.build(
      {},
      { transient: { length: faker.number.int({ min: 1, max: 10 }) } }
    ),
  cves: cveFactory.buildList(10),
  affected_packages: affectedPackageFactory.buildList(10),
  affected_systems: affectedSystemFactory.buildList(10),
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
    product: faker.internet.username(),
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
