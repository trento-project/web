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
  clusterResourceFactory,
} from '@lib/test-utils/factories';

import ClusterDetails from './ClusterDetails';
import HanaClusterDetails from './HanaClusterDetails';

const userAbilities = [{ name: 'all', resource: 'all' }];

const {
  id: clusterID,
  name: clusterName,
  type: clusterType,
  selected_checks: selectedChecks,
  provider,
  sap_instances: [{ sid }],
  cib_last_written: cibLastWritten,
  details,
} = clusterFactory.build({
  type: 'hana_scale_up',
  details: {
    architecture_type: 'classic',
    hana_scenario: 'performance_optimized',
  },
});

const scaleOutSites = hanaClusterSiteFactory.buildList(2);

const scaleOutDetails = hanaClusterDetailsFactory.build({
  architecture_type: 'classic',
  hana_scenario: 'unknown',
  sites: scaleOutSites,
  nodes: [
    hanaClusterDetailsNodesFactory.build({
      site: scaleOutSites[0].name,
      nameserver_actual_role: 'master',
      indexserver_actual_role: 'master',
    }),
    hanaClusterDetailsNodesFactory.build({
      site: scaleOutSites[1].name,
      nameserver_actual_role: 'master',
      indexserver_actual_role: 'master',
    }),
    hanaClusterDetailsNodesFactory.build({
      site: scaleOutSites[0].name,
      nameserver_actual_role: 'slave',
      indexserver_actual_role: 'slave',
    }),
    hanaClusterDetailsNodesFactory.build({
      site: scaleOutSites[1].name,
      nameserver_actual_role: 'slave',
      indexserver_actual_role: 'slave',
    }),
    hanaClusterDetailsNodesFactory.build({
      site: null,
      nameserver_actual_role: '',
      indexserver_actual_role: '',
    }),
  ],
});

const scaleOutDetailsNodeStatus = {
  ...scaleOutDetails,
  nodes: [
    { ...scaleOutDetails.nodes[0], status: 'Online' },
    { ...scaleOutDetails.nodes[1], status: 'Offline' },
    { ...scaleOutDetails.nodes[2], status: 'Standby' },
    { ...scaleOutDetails.nodes[3], status: 'Maintenance' },
    { ...scaleOutDetails.nodes[4], status: 'Other' },
  ],
};

const unmanagedNodeResources = {
  ...scaleOutDetails,
  nodes: [
    hanaClusterDetailsNodesFactory.build({
      site: scaleOutSites[0].name,
      resources: clusterResourceFactory.buildList(2, { managed: false }),
    }),
    hanaClusterDetailsNodesFactory.build({
      site: scaleOutSites[1].name,
      resources: clusterResourceFactory.buildList(2, { managed: false }),
    }),
  ],
};

const lastExecution = {
  loading: false,
  data: checksExecutionCompletedFactory.build({
    result: 'passing',
    passing_count: 3,
    warning_count: 2,
    critical_count: 1,
  }),
};

const hosts = details.nodes.map(({ name }) =>
  hostFactory.build({ hostname: name })
);

const scaleOutHosts = scaleOutDetails.nodes.map(({ name }) =>
  hostFactory.build({ hostname: name })
);

const sapSystems = sapSystemFactory.buildList(1, {
  sid,
  hana_scenario: 'performance_optimized',
});

const sapSystemList = [
  sapSystemFactory.build({ sid }),
  sapSystemFactory.build({ sid: 'QAS' }),
  sapSystemFactory.build({ sid: 'DEV' }),
];

const catalog = catalogFactory.build({ loading: false });

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
    <ContainerWrapper {...args}>
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
    clusterSids: [sid],
    provider,
    sapSystems,
    details,
    lastExecution,
    catalog,
    userAbilities,
    onStartExecution: () => {},
    navigate: () => {},
  },
};

export const HanaScaleUpCostOpt = {
  args: {
    ...Hana.args,
    clusterSids: [sid, 'QAS', 'DEV'],
    sapSystems: sapSystemList,
    details: { ...Hana.args.details, hana_scenario: 'cost_optimized' },
  },
};

export const HanaScaleUpCostOptWithoutEnrichedData = {
  args: {
    ...Hana.args,
    clusterSids: [sid, 'QAS', 'DEV'],
    details: { ...Hana.args.details, hana_scenario: 'cost_optimized' },
  },
};

export const HanaScaleOut = {
  args: {
    ...Hana.args,
    hosts: scaleOutHosts,
    details: scaleOutDetails,
    clusterType: 'hana_scale_out',
  },
};

export const HanaScaleOutWithNodeStatuses = {
  args: {
    ...HanaScaleOut.args,
    details: scaleOutDetailsNodeStatus,
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

export const WithUnmanagedResources = {
  args: {
    ...HanaScaleOut.args,
    details: unmanagedNodeResources,
  },
};

export const WithNoSBDDevices = {
  args: {
    ...Hana.args,
    details: {
      ...Hana.args.details,
      fencing_type: 'Diskless SBD',
      sbd_devices: [],
    },
  },
};

export const AngiArchitecturePerformanceScenario = {
  args: {
    ...Hana.args,
    details: {
      ...Hana.args.details,
      architecture_type: 'angi',
      hana_scenario: 'performance_optimized',
    },
  },
};

export const AngiArchitectureCostOptScenario = {
  args: {
    ...Hana.args,
    clusterSids: [sid, 'QAS', 'DEV'],
    sapSystems: sapSystemList,
    details: {
      ...Hana.args.details,
      architecture_type: 'angi',
      hana_scenario: 'cost_optimized',
    },
  },
};

export const AngiArchitectureCostOptScenarioWithoutEnrichedData = {
  args: {
    ...Hana.args,
    clusterSids: [sid, 'QAS1', 'DEV1'],
    sapSystems: sapSystemList,
    details: {
      ...Hana.args.details,
      architecture_type: 'angi',
      hana_scenario: 'cost_optimized',
    },
  },
};
