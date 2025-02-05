import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { patchForPackageFactory } from './relevantPatches';

const releaseVersionFactory = () =>
  `${faker.number.int({ min: 100000, max: 160000 })}.${faker.system.semver()}`;

export const upgradablePackageFactory = Factory.define(({ sequence }) => ({
  arch: faker.airline.flightNumber(),
  from_epoch: faker.date.anytime(),
  from_release: releaseVersionFactory(),
  from_version: faker.system.semver(),
  name: `${faker.word.noun()}${sequence}`,
  patches: patchForPackageFactory.buildList(2),
  to_epoch: faker.date.anytime(),
  to_package_id: `${faker.number.int({ min: 2000, max: 5000 })}`,
  to_release: releaseVersionFactory(),
  to_version: faker.system.semver(),
}));
