import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  clusterFactory,
  checksExecutionCompletedFactory,
  hostFactory,
} from '@lib/test-utils/factories';

import ClusterDetails from './ClusterDetails';

export default {
  title: 'ClusterDetails',
  components: ClusterDetails,
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

export function Hana() {
  const {
    id,
    name,
    sid,
    type,
    selected_checks,
    provider,
    cib_last_written,
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
  const clusterNodes = details.nodes.map((node) => ({
    ...node,
    ...hosts.find(({ hostname }) => hostname === node.name),
  }));

  return (
    <ContainerWrapper>
      <ClusterDetails
        clusterID={id}
        clusterName={name}
        selectedChecks={selected_checks}
        hasSelectedChecks
        hosts={hosts.map(({ id: hostID }) => hostID)}
        clusterType={type}
        cibLastWritten={cib_last_written}
        sid={sid}
        provider={provider}
        clusterNodes={clusterNodes}
        details={details}
        lastExecution={lastExecution}
        onStartExecution={() => {}}
        navigate={() => {}}
      />
    </ContainerWrapper>
  );
}
