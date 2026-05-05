// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { faker } from '@faker-js/faker';
import { providers } from '@lib/model';
import {
  abilityFactory,
  ascsErsClusterDetailsFactory,
  ascsErsClusterNodeFactory,
  ascsErsSapSystemFactory,
  buildHostsFromAscsErsClusterDetails,
  buildSapSystemsFromAscsErsClusterDetails,
  catalogFactory,
  checksExecutionCompletedFactory,
  clusterFactory,
} from '@lib/test-utils/factories';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

import AscsErsClusterDetails from './AscsErsClusterDetails';
import ClusterDetails from './ClusterDetails';

const {
  id: clusterID,
  name: clusterName,
  provider,
  cib_last_written: cibLastWritten,
  selected_checks: selectedChecks,
  details,
  state,
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

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });
const userAbilities = [allAbility];

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
  component: AscsErsClusterDetails,
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
  argTypes: {
    clusterID: {
      description: 'Unique identifier for the cluster',
      control: { type: 'text' },
    },
    hosts: {
      description: 'List of hosts in the cluster',
      control: { type: 'object' },
    },
    details: {
      description: 'Detailed information about the cluster',
      control: { type: 'object' },
    },
    lastExecution: {
      description: 'Information about the last checks execution',
      control: { type: 'object' },
    },
    userAbilities: {
      description: 'List of user abilities for actions on the cluster',
      control: { type: 'object' },
    },
    cibLastWritten: {
      description: 'Timestamp when the CIB was last written',
      control: { type: 'date' },
    },
    provider: {
      description: 'Cloud provider',
      control: { type: 'select' },
      options: [...providers, 'unrecognized-provider'],
    },
    sapSystems: {
      description: 'Array of SAP system objects for the cluster',
      control: { type: 'object' },
    },
    catalog: {
      description: 'Catalog data (may include loading and data fields)',
      control: { type: 'object' },
    },
    timezone: {
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
    },
    navigate: {
      description: 'Navigation function (e.g., from react-router)',
      action: 'navigate',
    },
    getClusterHostOperations: {
      description: 'Function returning available host operations for a host',
      action: 'getClusterHostOperations',
    },
  },
};

export const Default = {
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
    state,
    lastExecution,
    catalog,
    userAbilities,
    timezone: 'Etc/UTC',
    navigate: action('navigate'),
    getClusterHostOperations: action('getClusterHostOperations'),
  },
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
    state,
    lastExecution,
    catalog,
    userAbilities,
    timezone: 'Etc/UTC',
    navigate: action('navigate'),
    getClusterHostOperations: action('getClusterHostOperations'),
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
