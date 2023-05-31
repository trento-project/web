import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { faker } from '@faker-js/faker';

import {
  addHostsToAscsErsClusterDetails,
  ascsErsClusterDetailsFactory,
  ascsErsClusterNodeFactory,
  ascsErsSapSystemFactory,
  clusterFactory,
} from '@lib/test-utils/factories';

import AscsErsClusterDetails from './AscsErsClusterDetails';

const {
  name: clusterName,
  provider,
  cib_last_written: cibLastWritten,
  details,
} = clusterFactory.build({ type: 'ascs_ers' });

const multiSidDetails = ascsErsClusterDetailsFactory.build({
  sap_systems_count: 3,
});

const nodes = [
  ascsErsClusterNodeFactory.build({
    roles: ['ascs', 'ers'],
    virtual_ips: [faker.internet.ip(), faker.internet.ip()],
    filesystems: [faker.system.filePath(), faker.system.filePath()],
  }),
  ascsErsClusterNodeFactory.build({
    roles: [],
    virtual_ips: [],
    filesystems: [],
  }),
];

const failoverDetails = ascsErsClusterDetailsFactory.build({
  sap_systems: [ascsErsSapSystemFactory.build({ nodes, distributed: false })],
});

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
    hosts: addHostsToAscsErsClusterDetails(details),
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
    hosts: addHostsToAscsErsClusterDetails(multiSidDetails),
    details: multiSidDetails,
  },
  render: (args) => (
    <ContainerWrapper>
      <AscsErsClusterDetails {...args} />
    </ContainerWrapper>
  ),
};

export const Failover = {
  args: {
    clusterName,
    cibLastWritten,
    provider,
    hosts: addHostsToAscsErsClusterDetails(failoverDetails),
    details: failoverDetails,
  },
  render: (args) => (
    <ContainerWrapper>
      <AscsErsClusterDetails {...args} />
    </ContainerWrapper>
  ),
};
