import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  clusterFactory,
  checksExecutionCompletedFactory,
  hostFactory,
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

export default {
  title: 'HanaClusterDetails',
  components: HanaClusterDetails,
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
    details,
    lastExecution,
    onStartExecution: () => {},
    navigate: () => {},
  },
  render: (args) => (
    <ContainerWrapper>
      <HanaClusterDetails {...args} />
    </ContainerWrapper>
  ),
};
