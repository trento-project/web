import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  clusterFactory,
  hanaClusterDetailsFactory,
  hanaClusterDetailsNodesFactory,
  hanaClusterSiteFactory,
  hostFactory,
  checksExecutionCompletedFactory,
  checksExecutionRunningFactory,
  sapSystemFactory,
  catalogFactory,
} from '@lib/test-utils/factories';

import HanaClusterDetails from './HanaClusterDetails';

const {
  id: clusterID,
  name: clusterName,
  sid,
  type: clusterType,
  selected_checks: selectedChecks,
  provider,
  cib_last_written: cibLastWritten,
  details,
} = clusterFactory.build({ type: 'hana_scale_up' });

const scaleOutSites = hanaClusterSiteFactory.buildList(2);

const scaleOutDetails = hanaClusterDetailsFactory.build({
  sites: scaleOutSites,
  nodes: [
    hanaClusterDetailsNodesFactory.build({ site: scaleOutSites[0].name }),
    hanaClusterDetailsNodesFactory.build({ site: scaleOutSites[1].name }),
    hanaClusterDetailsNodesFactory.build({ site: scaleOutSites[0].name }),
    hanaClusterDetailsNodesFactory.build({ site: scaleOutSites[1].name }),
  ],
});

const lastExecution = {
  data: checksExecutionCompletedFactory.build({
    result: 'passing',
    passing_count: 3,
    warning_count: 2,
    critical_count: 1,
  }),
};

const hosts = [
  hostFactory.build({ hostname: details.nodes[0].name }),
  hostFactory.build({ hostname: details.nodes[1].name }),
];

const scaleOutHosts = [
  hostFactory.build({ hostname: scaleOutDetails.nodes[0].name }),
  hostFactory.build({ hostname: scaleOutDetails.nodes[1].name }),
  hostFactory.build({ hostname: scaleOutDetails.nodes[2].name }),
  hostFactory.build({ hostname: scaleOutDetails.nodes[3].name }),
];

const sapSystems = sapSystemFactory.buildList(1, { sid });

const catalog = catalogFactory.build();

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/HanaClusterDetails',
  components: HanaClusterDetails,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  render: (args) => (
    <ContainerWrapper>
      <HanaClusterDetails {...args} />
    </ContainerWrapper>
  ),
};

export const Hana = {
  args: {
    clusterID,
    clusterName,
    selectedChecks,
    hasSelectedChecks: true,
    hosts,
    clusterType,
    cibLastWritten,
    sid,
    provider,
    sapSystems,
    details,
    lastExecution,
    catalog,
    onStartExecution: () => {},
    navigate: () => {},
  },
};

export const HanaScaleOut = {
  args: {
    ...Hana.args,
    hosts: scaleOutHosts,
    details: scaleOutDetails,
  },
};

export const Loading = {
  args: {
    ...Hana.args,
    catalog: { loading: true },
  },
};

export const WithUnregisteredHost = {
  args: {
    ...Hana.args,
    hosts: hosts.slice(0, 1),
  },
};

export const WithNoSelectedChecks = {
  args: {
    ...Hana.args,
    selectedChecks: [],
    hasSelectedChecks: false,
  },
};

export const WithRunningExecution = {
  args: {
    ...Hana.args,
    lastExecution: { data: checksExecutionRunningFactory.build() },
  },
};
