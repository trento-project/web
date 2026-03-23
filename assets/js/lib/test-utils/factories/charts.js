import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

export const filesystemFactory = Factory.define(() => ({
  metric: {
    device: `/dev/${faker.lorem.word()}`,
    fstype: faker.helpers.arrayElement([
      'ext4',
      'xfs',
      'btrfs',
      'nfs',
      'tmpfs',
      'vfat',
      'zfs',
    ]),
    mountpoint: faker.system.directoryPath(),
  },
  sample: {
    timestamp: faker.date.recent().toISOString(),
    value: faker.number.int(),
  },
}));

export const swapFactory = Factory.define(() => ({
  timestamp: faker.date.recent().toISOString(),
  value: faker.number.int(),
}));
