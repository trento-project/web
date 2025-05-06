import React from 'react';

import { noop } from 'lodash';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { hostFactory, clusterFactory } from '@lib/test-utils/factories';

import {
  COMPLETED_EXECUTION_STATE,
  RUNNING_EXECUTION_STATE,
} from '@state/lastExecutions';

import ClusterDetailsHeader from './ClusterDetailsHeader';

const userAbilities = [{ name: 'all', resource: 'all' }];

describe('ClusterDetails ClusterDetailsHeader component', () => {
  it('should display cluster name', () => {
    const { id, name } = clusterFactory.build();

    render(
      <ClusterDetailsHeader
        clusterID={id}
        clusterName={name}
        executionLoading={false}
        executionStatus={COMPLETED_EXECUTION_STATE}
        hasSelectedChecks={false}
        hosts={[]}
        selectedChecks={[]}
        userAbilities={userAbilities}
        onStartExecution={noop}
        navigate={noop}
      />
    );

    expect(screen.getByRole('heading')).toHaveTextContent(
      `Pacemaker Cluster Details: ${name}`
    );
  });

  it.each([
    {
      condition: 'checks are not selected',
      hasSelectedChecks: false,
      executionLoading: false,
      executionStatus: COMPLETED_EXECUTION_STATE,
      userAbilities,
    },
    {
      condition: 'execution is loading',
      hasSelectedChecks: true,
      executionLoading: true,
      executionStatus: COMPLETED_EXECUTION_STATE,
      userAbilities,
    },
    {
      condition: 'execution is running',
      hasSelectedChecks: true,
      executionLoading: false,
      executionStatus: RUNNING_EXECUTION_STATE,
      userAbilities,
    },
    {
      condition: 'the user is not authorized',
      hasSelectedChecks: true,
      executionLoading: false,
      executionStatus: COMPLETED_EXECUTION_STATE,
      userAbilities: [],
    },
  ])(
    'should disable start check execution button if $condition',
    ({
      hasSelectedChecks,
      executionLoading,
      executionStatus,
      userAbilities: abilities,
    }) => {
      const { id, name } = clusterFactory.build();

      render(
        <ClusterDetailsHeader
          clusterID={id}
          clusterName={name}
          executionLoading={executionLoading}
          executionStatus={executionStatus}
          hasSelectedChecks={hasSelectedChecks}
          hosts={[]}
          selectedChecks={[]}
          userAbilities={abilities}
          onStartExecution={noop}
          navigate={noop}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Start Execution' })
      ).toBeDisabled();
    }
  );

  it('should navigate to the proper pages when check selection and result buttons are clicked', async () => {
    const user = userEvent.setup();
    const { id, name } = clusterFactory.build();
    const mockNavigate = jest.fn();

    render(
      <ClusterDetailsHeader
        clusterID={id}
        clusterName={name}
        executionLoading={false}
        executionStatus={COMPLETED_EXECUTION_STATE}
        hasSelectedChecks={false}
        hosts={[]}
        selectedChecks={[]}
        userAbilities={userAbilities}
        onStartExecution={noop}
        navigate={mockNavigate}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Check Selection' }));
    expect(mockNavigate).toHaveBeenCalledWith(`/clusters/${id}/settings`);

    await user.click(screen.getByRole('button', { name: 'Show Results' }));
    expect(mockNavigate).toHaveBeenCalledWith(
      `/clusters/${id}/executions/last`
    );
  });

  it('should start checks execution when button is clicked', async () => {
    const user = userEvent.setup();
    const { id, name } = clusterFactory.build();
    const mockStartExecution = jest.fn();
    const hosts = hostFactory.buildList(2);
    const selectedChecks = ['check1', 'check2'];

    render(
      <ClusterDetailsHeader
        clusterID={id}
        clusterName={name}
        executionLoading={false}
        executionStatus={COMPLETED_EXECUTION_STATE}
        hasSelectedChecks
        hosts={hosts}
        selectedChecks={selectedChecks}
        userAbilities={userAbilities}
        onStartExecution={mockStartExecution}
        navigate={noop}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Start Execution' }));
    expect(mockStartExecution).toHaveBeenCalledWith(id, hosts, selectedChecks);
  });
});
