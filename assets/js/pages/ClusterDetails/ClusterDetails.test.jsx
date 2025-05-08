import React from 'react';
import { faker } from '@faker-js/faker';
import { noop } from 'lodash';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { hostFactory, clusterFactory } from '@lib/test-utils/factories';
import { renderWithRouter } from '@lib/test-utils';

import {
  COMPLETED_EXECUTION_STATE,
  RUNNING_EXECUTION_STATE,
  REQUESTED_EXECUTION_STATE,
} from '@state/lastExecutions';

import ClusterDetails from './ClusterDetails';

const userAbilities = [{ name: 'all', resource: 'all' }];

describe('ClusterDetails ClusterDetails component', () => {
  it('should display cluster name', () => {
    const { id, name, details } = clusterFactory.build();

    renderWithRouter(
      <ClusterDetails
        clusterDetails={details}
        clusterID={id}
        clusterName={name}
        hasSelectedChecks={false}
        hosts={[]}
        selectedChecks={[]}
        userAbilities={userAbilities}
        onStartExecution={noop}
        navigate={noop}
      />
    );

    expect(
      screen.getByRole('heading', {
        name: `Pacemaker Cluster Details: ${name}`,
      })
    ).toBeInTheDocument();
  });

  it.each([
    {
      condition: 'checks are not selected',
      hasSelectedChecks: false,
      lastExecution: {
        loading: false,
        data: {
          status: COMPLETED_EXECUTION_STATE,
        },
      },
      userAbilities,
    },
    {
      condition: 'execution is loading',
      hasSelectedChecks: true,
      lastExecution: {
        loading: true,
        data: {
          status: COMPLETED_EXECUTION_STATE,
        },
      },
      userAbilities,
    },
    {
      condition: 'execution is running',
      hasSelectedChecks: true,
      lastExecution: {
        loading: false,
        data: {
          status: RUNNING_EXECUTION_STATE,
        },
      },
      userAbilities,
    },
    {
      condition: 'execution is requested',
      hasSelectedChecks: true,
      lastExecution: {
        loading: false,
        data: {
          status: REQUESTED_EXECUTION_STATE,
        },
      },
      userAbilities,
    },
    {
      condition: 'the user is not authorized',
      hasSelectedChecks: true,
      lastExecution: {
        loading: false,
        data: {
          status: COMPLETED_EXECUTION_STATE,
        },
      },
      userAbilities: [],
    },
  ])(
    'should disable start check execution button if $condition',
    ({ hasSelectedChecks, lastExecution, userAbilities: abilities }) => {
      const { id, name, details } = clusterFactory.build();

      renderWithRouter(
        <ClusterDetails
          clusterDetails={details}
          clusterID={id}
          clusterName={name}
          hasSelectedChecks={hasSelectedChecks}
          hosts={[]}
          lastExecution={lastExecution}
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
    const { id, name, details } = clusterFactory.build();
    const mockNavigate = jest.fn();

    renderWithRouter(
      <ClusterDetails
        clusterDetails={details}
        clusterID={id}
        clusterName={name}
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
    const { id, name, details } = clusterFactory.build();
    const mockStartExecution = jest.fn();
    const hosts = hostFactory.buildList(2);
    const selectedChecks = ['check1', 'check2'];

    renderWithRouter(
      <ClusterDetails
        clusterDetails={details}
        clusterID={id}
        clusterName={name}
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

  it.each([
    {
      selectedChecks: [],
      hasSelectedChecks: false,
      suggestionExpectation: (tooltipSuggestion) => {
        tooltipSuggestion.toBeVisible();
      },
    },
    {
      selectedChecks: [faker.string.uuid()],
      hasSelectedChecks: true,
      suggestionExpectation: (tooltipSuggestion) => {
        tooltipSuggestion.not.toBeInTheDocument();
      },
    },
  ])(
    'should suggest to the user to select some checks only when the selection is empty',
    async ({ selectedChecks, hasSelectedChecks, suggestionExpectation }) => {
      const user = userEvent.setup();
      const { id, name, details } = clusterFactory.build();

      renderWithRouter(
        <ClusterDetails
          clusterDetails={details}
          clusterID={id}
          clusterName={name}
          hasSelectedChecks={hasSelectedChecks}
          hosts={[]}
          selectedChecks={selectedChecks}
          userAbilities={userAbilities}
          onStartExecution={noop}
          navigate={noop}
        />
      );

      const startExecutionButton = screen.getByText('Start Execution');
      await user.hover(startExecutionButton);
      suggestionExpectation(
        expect(screen.queryByText('Select some Checks first!'))
      );
    }
  );

  describe('forbidden actions', () => {
    it('should disable check execution button when the user abilities are not compatible', async () => {
      const user = userEvent.setup();
      const { id, name, details } = clusterFactory.build();

      renderWithRouter(
        <ClusterDetails
          clusterDetails={details}
          clusterID={id}
          clusterName={name}
          hasSelectedChecks
          hosts={[]}
          selectedChecks={['check1']}
          userAbilities={[{ name: 'all', resource: 'other_resource' }]}
          onStartExecution={noop}
          navigate={noop}
        />
      );

      const startExecutionButton = screen.getByText('Start Execution');
      await user.hover(startExecutionButton);
      expect(
        screen.queryByText('You are not authorized for this action')
      ).toBeInTheDocument();
    });

    it('should enable check execution button when the user abilities are compatible', async () => {
      const user = userEvent.setup();
      const { id, name, details } = clusterFactory.build();

      renderWithRouter(
        <ClusterDetails
          clusterDetails={details}
          clusterID={id}
          clusterName={name}
          hasSelectedChecks
          hosts={[]}
          selectedChecks={['check1']}
          userAbilities={[
            { name: 'all', resource: 'cluster_checks_execution' },
          ]}
          onStartExecution={noop}
          navigate={noop}
        />
      );

      const startExecutionButton = screen.getByText('Start Execution');
      await user.hover(startExecutionButton);
      expect(
        screen.queryByText('You are not authorized for this action')
      ).not.toBeInTheDocument();
    });
  });
});
