import React from 'react';
import { faker } from '@faker-js/faker';
import { noop } from 'lodash';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { hostFactory, clusterFactory } from '@lib/test-utils/factories';
import { renderWithRouter } from '@lib/test-utils';
import { CLUSTER_MAINTENANCE_CHANGE } from '@lib/operations';

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
        clusterID={id}
        clusterName={name}
        details={details}
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
          clusterID={id}
          clusterName={name}
          details={details}
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
        clusterID={id}
        clusterName={name}
        details={details}
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
        clusterID={id}
        clusterName={name}
        details={details}
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
          clusterID={id}
          clusterName={name}
          details={details}
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

  describe('operations', () => {
    it('should open cluster maintenance change modal', async () => {
      const user = userEvent.setup();
      const { id, name, details } = clusterFactory.build();

      renderWithRouter(
        <ClusterDetails
          clusterID={id}
          clusterName={name}
          details={details}
          hasSelectedChecks
          hosts={[]}
          selectedChecks={[]}
          userAbilities={userAbilities}
          onStartExecution={noop}
          navigate={noop}
          operationsEnabled
        />
      );

      const operationsButton = screen.getByRole('button', {
        name: 'Operations',
      });
      await user.click(operationsButton);

      const menuItem = screen.getByRole('menuitem', {
        name: 'Cluster Maintenance',
      });
      expect(menuItem).toBeEnabled();
      await user.click(menuItem);

      expect(
        screen.getByRole('heading', { name: 'Cluster Maintenance' })
      ).toBeInTheDocument();
    });

    it('should show cluster maintenance change operation running', async () => {
      const user = userEvent.setup();
      const { id, name, details } = clusterFactory.build();

      renderWithRouter(
        <ClusterDetails
          clusterID={id}
          clusterName={name}
          details={details}
          hasSelectedChecks
          hosts={[]}
          runningOperation={{ operation: CLUSTER_MAINTENANCE_CHANGE }}
          selectedChecks={[]}
          userAbilities={userAbilities}
          operationsEnabled
        />
      );

      const operationsButton = screen.getByRole('button', {
        name: 'Operations',
      });
      await user.click(operationsButton);

      const menuItem = screen.getByRole('menuitem', {
        name: 'Cluster Maintenance',
      });
      expect(menuItem).toBeDisabled();

      const { getByTestId } = within(menuItem);

      expect(getByTestId('eos-svg-component')).toBeInTheDocument();
    });

    it('should show cluster maintenance change operation forbidden message', async () => {
      const user = userEvent.setup();
      const { id, name, details } = clusterFactory.build();
      const mockCleanForbiddenOperation = jest.fn();

      renderWithRouter(
        <ClusterDetails
          clusterID={id}
          clusterName={name}
          details={details}
          hasSelectedChecks
          hosts={[]}
          runningOperation={{
            operation: CLUSTER_MAINTENANCE_CHANGE,
            forbidden: true,
            errors: ['error1', 'error2'],
          }}
          selectedChecks={[]}
          userAbilities={userAbilities}
          onCleanForbiddenOperation={mockCleanForbiddenOperation}
          operationsEnabled
        />
      );

      expect(screen.getByText('Operation Forbidden')).toBeInTheDocument();
      expect(
        screen.getByText('Unable to run Cluster maintenance change operation', {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('error1')).toBeInTheDocument();
      expect(screen.getByText('error2')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', {
        name: 'Close',
      });
      await user.click(closeButton);
      expect(mockCleanForbiddenOperation).toHaveBeenCalled();
    });
  });

  describe('forbidden actions', () => {
    it('should disable check execution button when the user abilities are not compatible', async () => {
      const user = userEvent.setup();
      const { id, name, details } = clusterFactory.build();

      renderWithRouter(
        <ClusterDetails
          clusterID={id}
          clusterName={name}
          details={details}
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
          clusterID={id}
          clusterName={name}
          details={details}
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

    it.each([
      {
        forbidden: true,
        operation: CLUSTER_MAINTENANCE_CHANGE,
        label: 'Cluster Maintenance',
        abilities: [],
      },
      {
        forbidden: false,
        operation: CLUSTER_MAINTENANCE_CHANGE,
        label: 'Cluster Maintenance',
        abilities: [{ name: 'maintenance_change', resource: 'cluster' }],
      },
    ])(
      'should forbid/authorize $operation operation',
      async ({ forbidden, label, abilities }) => {
        const user = userEvent.setup();
        const { id, name, details } = clusterFactory.build();

        renderWithRouter(
          <ClusterDetails
            clusterID={id}
            clusterName={name}
            details={details}
            hasSelectedChecks
            hosts={[]}
            selectedChecks={['check1']}
            userAbilities={abilities}
            operationsEnabled
          />
        );

        await user.click(screen.getByRole('button', { name: 'Operations' }));
        const menuitem = screen.getByRole('menuitem', { name: label });

        if (forbidden) {
          expect(menuitem).toBeDisabled();
        } else {
          expect(menuitem).toBeEnabled();
        }
      }
    );
  });
});
