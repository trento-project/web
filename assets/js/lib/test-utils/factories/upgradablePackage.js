import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { patchForPackageFactory } from './relevantPatches';

const releaseVersionFactory = () =>
  `${faker.number.int({ min: 100000, max: 160000 })}.${faker.system.semver()}`;

export const upgradablePackageFactory = Factory.define(() => ({
  from_epoch: faker.date.anytime(),
  to_release: releaseVersionFactory(),
  name: faker.company.buzzNoun(),
  from_release: releaseVersionFactory(),
  to_epoch: faker.date.anytime(),
  arch: faker.airline.flightNumber(),
  to_package_id: faker.number.int({ min: 2000, max: 5000 }),
  from_version: faker.system.semver(),
  to_version: faker.system.semver(),
  from_arch: faker.airline.flightNumber(),
  to_arch: faker.airline.flightNumber(),
  patches: patchForPackageFactory.buildList(2),
}));
