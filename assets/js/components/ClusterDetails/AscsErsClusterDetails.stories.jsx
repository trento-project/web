import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  ascsErsClusterDetailsFactory,
  clusterFactory,
} from '@lib/test-utils/factories';

import AscsErsClusterDetails from './AscsErsClusterDetails';

const {
  name: clusterName,
  provider,
  cib_last_written: cibLastWritten,
  details,
} = clusterFactory.build({ type: 'ascs_ers' });

export default {
  title: 'AscsErsClusterDetails',
  components: AscsErsClusterDetails,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export const Single = {
  args: {
    clusterName,
    cibLastWritten,
    provider,
    details,
  },
  render: (args) => (
    <ContainerWrapper>
      <AscsErsClusterDetails {...args} />
    </ContainerWrapper>
  ),
};

export const MultiSID = {
  args: {
    ...Single.args,
    details: ascsErsClusterDetailsFactory.build({ sap_systems_count: 3 }),
  },
  render: (args) => (
    <ContainerWrapper>
      <AscsErsClusterDetails {...args} />
    </ContainerWrapper>
  ),
};
