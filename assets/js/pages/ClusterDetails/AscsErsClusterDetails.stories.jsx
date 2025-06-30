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
  checksExecutionCompletedFactory,
} from '@lib/test-utils/factories';

import ClusterDetails from './ClusterDetails';
import AscsErsClusterDetails from './AscsErsClusterDetails';

const {
  id: clusterID,
  name: clusterName,
  provider,
  cib_last_written: cibLastWritten,
  selected_checks: selectedChecks,
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

const catalog = catalogFactory.build({ loading: false });

const lastExecution = {
  loading: false,
  data: checksExecutionCompletedFactory.build({
    result: 'passing',
    passing_count: 3,
    warning_count: 2,
    critical_count: 1,
  }),
};

const failoverDetails = ascsErsClusterDetailsFactory.build({
  sap_systems: [ascsErsSapSystemFactory.build({ nodes, distributed: false })],
  catalog,
});

const userAbilities = [{ name: 'all', resource: 'all' }];

function ContainerWrapper({ children, ...props }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <ClusterDetails operationsEnabled {...props}>
        {children}
      </ClusterDetails>
    </div>
  );
}

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
  render: (args) => (
    <ContainerWrapper {...args}>
      <AscsErsClusterDetails {...args} />
    </ContainerWrapper>
  ),
};

export const Single = {
  args: {
    clusterID,
    clusterName,
    cibLastWritten,
    provider,
    selectedChecks,
    hasSelectedChecks: true,
    hosts: buildHostsFromAscsErsClusterDetails(details),
    sapSystems: buildSapSystemsFromAscsErsClusterDetails(details),
    details,
    lastExecution,
    catalog,
    userAbilities,
  },
};

export const Loading = {
  args: {
    ...Single.args,
    catalog: { loading: true },
  },
};

export const WithUnregisteredHost = {
  args: {
    ...Single.args,
    hosts: Single.args.hosts.slice(0, 1),
  },
};

export const MultiSID = {
  args: {
    ...Single.args,
    hosts: buildHostsFromAscsErsClusterDetails(multiSidDetails),
    sapSystems: buildSapSystemsFromAscsErsClusterDetails(multiSidDetails),
    details: multiSidDetails,
  },
};

export const Failover = {
  args: {
    ...Single.args,
    hosts: buildHostsFromAscsErsClusterDetails(failoverDetails),
    sapSystems: buildSapSystemsFromAscsErsClusterDetails(failoverDetails),
    details: failoverDetails,
  },
};
