import { providers } from '@lib/model';
import { clusterTypes } from '@lib/model/clusters';
import {
  abilityFactory,
  catalogFactory,
  checksExecutionCompletedFactory,
  checksExecutionRunningFactory,
  clusterFactory,
  clusterResourceFactory,
  hanaClusterDetailsFactory,
  hanaClusterDetailsNodesFactory,
  hanaClusterSiteFactory,
  hostFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

import ClusterDetails from './ClusterDetails';
import HanaClusterDetails from './HanaClusterDetails';

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });
const userAbilities = [allAbility];

const {
  id: clusterID,
  name: clusterName,
  type: clusterType,
  selected_checks: selectedChecks,
  provider,
  sap_instances: [{ sid }],
  cib_last_written: cibLastWritten,
  details,
  state,
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
  nodes: scaleOutDetails.nodes.map((node, index) => ({
    ...node,
    status: ['Online', 'Offline', 'Standby', 'Maintenance', 'Other'][index],
  })),
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

const unmanagedResources = clusterResourceFactory.buildList(2, {
  managed: false,
  parent: { managed: false },
  node: scaleOutHosts[0].hostname,
});

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
  component: HanaClusterDetails,
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
    clusterType: {
      description: 'Type of the cluster',
      control: { type: 'select' },
      options: clusterTypes,
    },
    clusterSids: {
      description: 'List of cluster SIDs',
      control: { type: 'object' },
    },
  },
};

export const Default = {
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
    state,
    lastExecution,
    catalog,
    userAbilities,
    timezone: 'Etc/UTC',
    onStartExecution: action('onStartExecution'),
    navigate: action('navigate'),
    getClusterHostOperations: action('getClusterHostOperations'),
  },
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
    state,
    lastExecution,
    catalog,
    userAbilities,
    onStartExecution: action('onStartExecution'),
    navigate: action('navigate'),
    getClusterHostOperations: action('getClusterHostOperations'),
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
    details: {
      ...scaleOutDetails,
      resources: unmanagedResources,
    },
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
