import { faker } from '@faker-js/faker';

import GatheredFacts from './GatheredFacts';

const factValues = {
  application: faker.animal.bear(),
  firewall: faker.lorem.sentence(),
  protocol: faker.animal.bear(),
  harddrive: faker.animal.bear(),
  pixel: [
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    [faker.lorem.sentence(), faker.lorem.sentence()],
  ],
};
export default {
  title: 'GatheredFacts',
  component: GatheredFacts,
};

export const Default = {
  args: {
    isTargetHost: true,
    gatheredFacts: [
      {
        value: factValues,
        type: faker.lorem.sentence(),
        message: faker.lorem.sentence(),
        name: faker.animal.bear(),
      },
      {
        value: factValues,
        name: faker.animal.bear(),
      },
    ],
  },
};
