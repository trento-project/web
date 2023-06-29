import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  clusterFactory,
  databaseInstanceFactory,
  databaseFactory,
  hostFactory,
} from '@lib/test-utils/factories';
import { DATABASE_TYPE } from '@lib/model';
import { keysToCamel } from '@lib/serialization';

import { GenericSystemDetails } from '@components/SapSystemDetails';

const system = {
  ...keysToCamel(
    databaseFactory.build({ instances: databaseInstanceFactory.buildList(2) })
  ),
  hosts: hostFactory.buildList(2, { cluster: clusterFactory.build() }),
};

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'DatabaseDetails',
  components: GenericSystemDetails,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  render: (args) => (
    <ContainerWrapper>
      <GenericSystemDetails {...args} />
    </ContainerWrapper>
  ),
};

export const Database = {
  args: {
    title: 'Database Details',
    type: DATABASE_TYPE,
    system,
  },
};
