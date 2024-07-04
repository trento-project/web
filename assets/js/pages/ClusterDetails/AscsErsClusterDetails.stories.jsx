import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { faker } from '@faker-js/faker';

import {
  buildHostsFromAscsErsClusterDetails,
  buildSapSystemsFromAscsErsClusterDetails,
  ascsErsClusterDetailsFactory,
  ascsErsClusterNodeFactory,
  ascsErsSapSystemFactory,
  clusterFactory,
  catalogFactory,
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

const catalog = catalogFactory.build();

const failoverDetails = ascsErsClusterDetailsFactory.build({
  sap_systems: [ascsErsSapSystemFactory.build({ nodes, distributed: false })],
  catalog,
});

const userAbilities = [{ name: 'all', resource: 'all' }];

export default {
  title: 'Layouts/AscsErsClusterDetails',
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
    hosts: buildHostsFromAscsErsClusterDetails(details),
    sapSystems: buildSapSystemsFromAscsErsClusterDetails(details),
    details,
    userAbilities,
  },
  render: (args) => (
    <ContainerWrapper>
      <AscsErsClusterDetails {...args} />
    </ContainerWrapper>
  ),
};

export const Loading = {
  args: {
    ...Single.args,
    catalog: { loading: true },
  },
  render: (args) => (
    <ContainerWrapper>
      <AscsErsClusterDetails {...args} />
    </ContainerWrapper>
  ),
};

export const WithUnregisteredHost = {
  args: {
    ...Single.args,
    hosts: Single.args.hosts.slice(0, 1),
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
    hosts: buildHostsFromAscsErsClusterDetails(multiSidDetails),
    sapSystems: buildSapSystemsFromAscsErsClusterDetails(multiSidDetails),
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
    userAbilities,
    hosts: buildHostsFromAscsErsClusterDetails(failoverDetails),
    sapSystems: buildSapSystemsFromAscsErsClusterDetails(failoverDetails),
    details: failoverDetails,
  },
  render: (args) => (
    <ContainerWrapper>
      <AscsErsClusterDetails {...args} />
    </ContainerWrapper>
  ),
};
