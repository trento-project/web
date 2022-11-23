import React from 'react';
import { act, screen } from '@testing-library/react';

import { renderWithRouter } from '@lib/test-utils';
import {
  hostnameFactory,
  checksExecutionFactory,
  catalogCheckFactory,
} from '@lib/test-utils/factories';

import ExecutionResults from './ExecutionResults';

describe('ExecutionResults', () => {
  it('should render ExecutionResults with successfully fetched results', async () => {
    const hostnames = hostnameFactory.buildList(2);
    const [{ id: agentID, hostname }] = hostnames;
    const executionResult = checksExecutionFactory.build({
      agentID,
      status: 'completed',
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

    expect(screen.getByText(hostname)).toBeTruthy();
    expect(screen.getByText(checkID)).toBeTruthy();
  });

  it('should render ExecutionResults with running state', async () => {
    const hostnames = hostnameFactory.buildList(2);
    const [{ id: agentID }] = hostnames;
    const executionResult = checksExecutionFactory.build({
      agentID,
      status: 'running',
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

    expect(
      screen.getByText('Check execution currently running...')
    ).toBeTruthy();
  });
});
