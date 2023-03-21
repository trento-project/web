import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { hostFactory, clusterFactory } from '@lib/test-utils/factories';

import ExecutionResults from '.';

const executionID = '9fbcaec6-e65e-4adc-9cac-fc542c66717b';
const agentID = '22248a4c-216f-45d8-90ff-904d27900efc';
const groupID = '02acea9d-9658-4902-9806-0eef2bfbbf5d';
const cloudProvider = 'azure';

const { name: clusterName, type: clusterScenario } = clusterFactory.build({
  id: groupID,
  type: 'hana_scale_up',
});

const clusterHosts = [
  hostFactory.build({
    id: agentID,
    hostname: 'carbonarahost01',
    cluster_id: groupID,
  }),
];

const runningExecution = {
  data: {
    check_results: null,
    completed_at: null,
    execution_id: executionID,
    group_id: groupID,
    result: null,
    started_at: '2022-11-09T15:11:31.436586Z',
    status: 'running',
    timeout: null,
  },
};

const completedExecution = {
  data: {
    check_results: [
      {
        agents_check_results: [
          {
            agent_id: agentID,
            expectation_evaluations: [
              {
                name: 'expectation_example',
                return_value: 123,
                type: 'expect',
              },
            ],
            facts: [
              { check_id: '156F64', name: 'lol_this_is_a_fact', value: 123 },
            ],
            values: [],
          },
        ],
        check_id: '156F64',
        expectation_results: [
          { name: 'expectation_example', result: true, type: 'expect' },
        ],
        result: 'passing',
      },
    ],
    completed_at: '2022-11-09T17:02:20.629366Z',
    execution_id: executionID,
    group_id: groupID,
    result: 'passing',
    started_at: '2022-11-09T15:11:31.436586Z',
    status: 'completed',
    timeout: [],
  },
};

const catalogData = {
  data: {
    items: [
      {
        description: 'Corosync `token` timeout is set to expected value\n',
        expectations: [
          {
            expression:
              'facts.corosync_token_timeout == values.expected_token_timeout',
            name: 'timeout',
            type: 'expect',
          },
        ],
        facts: [
          {
            argument: 'totem.token',
            gatherer: 'corosync.conf',
            name: 'corosync_token_timeout',
          },
        ],
        group: 'Corosync',
        id: '156F64',
        name: 'Corosync configuration file',
        remediation:
          '## Abstract\nThe value of the Corosync `token` timeout is not set as recommended.\n## Remediation\n...\n',
        severity: 'critical',
        values: [
          {
            conditions: [
              {
                expression: 'env.provider == "azure" || env.provider == "aws"',
                value: 30000,
              },
              { expression: 'env.provider == "gcp"', value: 20000 },
            ],
            default: 5000,
            name: 'expected_token_timeout',
          },
        ],
      },
    ],
  },
};

const fetchRunning = () =>
  new Promise((resolve, _reject) => {
    setTimeout(() => resolve(runningExecution), 3000);
  });

const fetchCompleted = () =>
  new Promise((resolve, _reject) => {
    setTimeout(() => resolve(completedExecution), 3000);
  });

const fetchCatalog = () =>
  new Promise((resolve, _reject) => {
    setTimeout(() => resolve(catalogData), 3000);
  });

export default {
  title: 'ExecutionResults',
  components: ExecutionResults,
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

export function Running() {
  return (
    <ContainerWrapper>
      <ExecutionResults
        clusterID={groupID}
        clusterHosts={clusterHosts}
        clusterName={clusterName}
        clusterScenario={clusterScenario}
        cloudProvider={cloudProvider}
        onExecutionFetch={fetchRunning}
        onCatalogFetch={fetchCatalog}
        catalog={catalogData.data.items}
        executionRunning
      />
    </ContainerWrapper>
  );
}

export function Completed() {
  return (
    <ContainerWrapper>
      <ExecutionResults
        clusterID={groupID}
        clusterHosts={clusterHosts}
        clusterName={clusterName}
        clusterScenario={clusterScenario}
        cloudProvider={cloudProvider}
        onExecutionFetch={fetchCompleted}
        onCatalogFetch={fetchCatalog}
        catalog={catalogData.data.items}
        executionRunning={false}
        executionData={completedExecution.data}
      />
    </ContainerWrapper>
  );
}
