import React from 'react';
import { act, screen } from '@testing-library/react';

import { renderWithRouter } from '@lib/test-utils';
import {
  hostnameFactory,
  agentCheckResultFactory,
  checksExecutionCompletedFactory,
  checksExecutionRunningFactory,
  checkResultFactory,
  catalogCheckFactory,
} from '@lib/test-utils/factories';

import ExecutionResults from './ExecutionResults';

describe('ExecutionResults', () => {
  it('should render ExecutionResults with successfully fetched results', async () => {
    const hostnames = hostnameFactory.buildList(2);
    const [
      { id: agentID1, hostname: hostname1 },
      { id: agentID2, hostname: hostname2 },
    ] = hostnames;

    const agent1 = agentCheckResultFactory.build({ agent_id: agentID1 });
    const agent2 = agentCheckResultFactory.build({ agent_id: agentID2 });
    const checkResults = checkResultFactory.buildList(1, {
      agents_check_results: [agent1, agent2],
    });

    const executionResult = checksExecutionCompletedFactory.build({
      check_results: checkResults,
      result: 'passing',
    });
    const {
      groupID: clusterID,
      execution_id: executionID,
      check_results: [{ check_id: checkID }],
    } = executionResult;
    const catalog = [catalogCheckFactory.build({ id: checkID })];

    await act(async () => {
      renderWithRouter(
        <ExecutionResults
          clusterID={clusterID}
          executionID={executionID}
          onExecutionFetch={() => Promise.resolve({ data: executionResult })}
          onCatalogFetch={() => Promise.resolve({ data: { items: catalog } })}
          hostnames={hostnames}
        />
      );
    });

    expect(screen.getByText(hostname1)).toBeTruthy();
    expect(screen.getByText(hostname2)).toBeTruthy();
    expect(screen.getAllByText(checkID)).toHaveLength(2);
  });

  it('should render ExecutionResults with running state', async () => {
    const hostnames = hostnameFactory.buildList(2);
    const executionResult = checksExecutionRunningFactory.build();
    const { group_id: clusterID, execution_id: executionID } = executionResult;

    await act(async () => {
      renderWithRouter(
        <ExecutionResults
          clusterID={clusterID}
          executionID={executionID}
          onExecutionFetch={() => Promise.resolve({ data: executionResult })}
          onCatalogFetch={() => Promise.resolve({ data: { items: [] } })}
          hostnames={hostnames}
        />
      );
    });

    expect(
      screen.getByText('Check execution currently running...')
    ).toBeTruthy();
  });
});
