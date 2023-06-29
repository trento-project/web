import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { hostFactory, clusterFactory } from '@lib/test-utils/factories';

import ExecutionResults from '.';

const executionID = '9fbcaec6-e65e-4adc-9cac-fc542c66717b';
const agentID = [
  '8a2a4977-357d-4b76-b3c0-9b6a0e334d9d',
  'e1b2fc0e-8eae-42bb-81a7-6ddc8d13e05b',
  '3f9675e9-2c59-4f0e-a1e8-7ebd4df3d90c',
  'b1dc32a5-9466-4e2d-bd4f-9a462c153c36',
];
const checkID = ['DC5429', 'FB0E0D', '68626E', '15F7A8'];
const checkNames = [
  'SBD_PACEMAKER',
  'corosync running 2 ring configuration',
  'SBD msgwait timeout',
  'Check Corosync token_retransmits_before_loss_const during runtime',
];
const checkResults = ['passing', 'warning', 'critical', 'unknown'];
const checkIsPremium = [true, false];
const checkGroup = ['Corosync', 'SBD'];
const checkDescription = [
  'Corosync `token` timeout is set to expected value\n',
  'Corosync is running with consensus timeout set to the recommended value',
  'SBD msgwait timeout value is at least two times the watchdog timeout',
  'Corosync is running with `token_retransmits_before_loss_const` set to the recommended value',
];
const checkRemediation = [
  'Additional remediation instructions',
  'Abstract the value of the Corosync `token` timeout is not set as recommended',
];

const groupID = '02acea9d-9658-4902-9806-0eef2bfbbf5d';
const cloudProvider = 'azure';

const { name: clusterName, type: clusterScenario } = clusterFactory.build({
  id: groupID,
  type: 'hana_scale_up',
});

const clusterHosts = [
  hostFactory.build({
    id: agentID[0],
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
            agent_id: agentID[0],
            expectation_evaluations: [
              {
                name: checkNames[0],
                return_value: 123,
                type: 'expect',
              },
            ],
            facts: [
              { check_id: checkID[0], name: 'lol_this_is_a_fact', value: 123 },
            ],
            values: [],
          },
        ],
        check_id: checkID[0],
        expectation_results: [
          { name: checkNames[0], result: true, type: 'expect' },
        ],
        result: checkResults[0],
      },

      {
        agents_check_results: [
          {
            agent_id: agentID[1],
            expectation_evaluations: [
              {
                name: checkNames[1],
                return_value: 456,
                type: 'expect',
              },
            ],
            facts: [{ check_id: checkID[1], name: 'new_fact', value: 456 }],
            values: [],
          },
        ],
        check_id: checkID[1],
        expectation_results: [
          { name: checkNames[1], result: true, type: 'expect' },
        ],
        result: checkResults[1],
      },

      {
        agents_check_results: [
          {
            agent_id: agentID[2],
            expectation_evaluations: [
              {
                name: checkNames[2],
                return_value: 456,
                type: 'expect',
              },
            ],
            facts: [{ check_id: checkID[2], name: 'new_fact', value: 456 }],
            values: [],
          },
        ],
        check_id: checkID[2],
        expectation_results: [
          { name: checkNames[2], result: true, type: 'expect' },
        ],
        result: checkResults[2],
      },
      {
        agents_check_results: [
          {
            agent_id: agentID[3],
            expectation_evaluations: [
              {
                name: checkNames[3],
                return_value: 456,
                type: 'expect',
              },
            ],
            facts: [{ check_id: checkID[3], name: 'new_fact', value: 456 }],
            values: [],
          },
        ],
        check_id: checkID[3],
        expectation_results: [
          { name: checkNames[3], result: true, type: 'expect' },
        ],
        result: checkResults[3],
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
        description: checkDescription[0],
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
        group: checkGroup[0],
        premium: checkIsPremium[1],
        id: checkID[0],
        name: checkNames[0],
        remediation: checkRemediation[1],
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
      {
        id: checkID[1],
        description: checkDescription[1],
        expectations: [
          {
            expression: 'additional_expression',
            name: 'additional_expectation',
            type: 'expect',
          },
        ],
        facts: [
          {
            argument: 'additional_argument',
            gatherer: 'additional_gatherer',
            name: 'additional_fact',
          },
        ],
        group: checkGroup[0],
        premium: checkIsPremium[0],
        name: checkNames[1],
        remediation: checkRemediation[0],
        values: [
          {
            conditions: [
              {
                expression: 'additional_condition_expression',
                value: 'additional_condition_value',
              },
            ],
            default: 'additional_default_value',
            name: 'additional_value',
          },
        ],
      },
      {
        id: checkID[2],
        description: checkDescription[2],
        expectations: [
          {
            expression: 'additional_expression',
            name: 'additional_expectation',
            type: 'expect',
          },
        ],
        facts: [
          {
            argument: 'additional_argument',
            gatherer: 'additional_gatherer',
            name: 'additional_fact',
          },
        ],
        group: checkGroup[1],
        premium: checkIsPremium[0],
        name: checkNames[2],
        remediation: checkRemediation[0],
        values: [
          {
            conditions: [
              {
                expression: 'additional_condition_expression',
                value: 'additional_condition_value',
              },
            ],
            default: 'additional_default_value',
            name: 'additional_value',
          },
        ],
      },
      {
        id: checkID[3],
        description: checkDescription[3],
        expectations: [
          {
            expression: 'additional_expression',
            name: 'additional_expectation',
            type: 'expect',
          },
        ],
        facts: [
          {
            argument: 'additional_argument',
            gatherer: 'additional_gatherer',
            name: 'additional_fact',
          },
        ],
        group: checkGroup[0],
        premium: checkIsPremium[1],
        name: checkNames[3],
        remediation: checkRemediation[0],

        values: [
          {
            conditions: [
              {
                expression: 'additional_condition_expression',
                value: 'additional_condition_value',
              },
            ],
            default: 'additional_default_value',
            name: 'additional_value',
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
