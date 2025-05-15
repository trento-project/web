import React from 'react';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { renderWithRouter } from '@lib/test-utils';
import {
  hostFactory,
  saptuneStatusFactory,
  databaseInstanceFactory,
} from '@lib/test-utils/factories';
import { TUNING_VALUES } from '@pages/SaptuneDetails/SaptuneDetails.test';
import { DATABASE_TYPE } from '@lib/model/sapSystems';
import {
  SAPTUNE_SOLUTION_APPLY,
  SAPTUNE_SOLUTION_CHANGE,
} from '@lib/operations';

import HostDetails from './HostDetails';

const axiosMock = new MockAdapter(networkClient);
const userAbilities = [{ name: 'all', resource: 'all' }];
const applySaptuneSolution = 'Apply Saptune Solution';
const changeSaptuneSolution = 'Change Saptune Solution';

describe('HostDetails component', () => {
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onGet(/\/api\/v1\/charts.*/gm).reply(200, {});
  });

  describe('Checks execution', () => {
    it('should show the Checks related action buttons', () => {
      renderWithRouter(
        <HostDetails agentVersion="1.0.0" userAbilities={userAbilities} />
      );

      expect(
        screen.getByRole('button', { name: 'Check Selection' })
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Show Results' })
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Start Execution' })
      ).toBeVisible();
    });

    it('should disable start execution button when checks are not selected', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <HostDetails
          agentVersion="1.0.0"
          selectedChecks={[]}
          userAbilities={userAbilities}
        />
      );

      const startExecutionButton = screen.getByText('Start Execution');
      expect(startExecutionButton).toBeDisabled();

      await user.hover(startExecutionButton);
      expect(screen.getByText('Select some Checks first!')).toBeInTheDocument();
    });

    it('should enable start execution button when checks are selected', async () => {
      const user = userEvent.setup();
      const selectedChecks = [faker.animal.bear(), faker.animal.bear()];

      renderWithRouter(
        <HostDetails
          agentVersion="1.0.0"
          selectedChecks={selectedChecks}
          userAbilities={userAbilities}
        />
      );

      const startExecutionButton = screen.getByText('Start Execution');
      expect(startExecutionButton).toBeEnabled();

      await user.hover(startExecutionButton);
      expect(
        screen.queryByText('Select some Checks first!')
      ).not.toBeInTheDocument();
    });
  });

  describe('Summary box', () => {
    describe('agent version', () => {
      const message =
        'The Agent version is outdated, some features might not work properly. It is advised to keep the Agents up to date with the Server.';

      it('should not show any warning message if the agent version is correct', () => {
        renderWithRouter(
          <HostDetails agentVersion="2.0.0" userAbilities={userAbilities} />
        );

        expect(screen.queryByText(message)).not.toBeInTheDocument();
      });

      it('should show a warning message if the agent version is outdated', () => {
        renderWithRouter(
          <HostDetails agentVersion="1.0.0" userAbilities={userAbilities} />
        );

        expect(screen.getByText(message)).toBeInTheDocument();
      });
    });

    describe('IP addresses', () => {
      it('should show IP addresses with CIDR notation', () => {
        renderWithRouter(
          <HostDetails
            agentVersion="2.0.0"
            ipAddresses={['10.0.0.5', '10.0.0.6']}
            netmasks={[24, 32]}
            userAbilities={userAbilities}
          />
        );

        expect(
          screen.getByText('10.0.0.5/24, 10.0.0.6/32')
        ).toBeInTheDocument();
      });

      it('should show plain IP addresses if netmasks are null', () => {
        renderWithRouter(
          <HostDetails
            agentVersion="2.0.0"
            ipAddresses={['10.0.0.5', '10.0.0.6']}
            netmasks={[null, null]}
            userAbilities={userAbilities}
          />
        );

        expect(screen.getByText('10.0.0.5, 10.0.0.6')).toBeInTheDocument();
      });
    });
  });

  describe('deregistration', () => {
    it('should not display clean up button when host is not deregisterable', () => {
      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          deregisterable={false}
          userAbilities={userAbilities}
        />
      );

      expect(
        screen.queryByRole('button', { name: 'Clean up' })
      ).not.toBeInTheDocument();
    });

    it('should display clean up button when host is deregisterable', () => {
      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          deregisterable
          userAbilities={[{ name: 'all', resource: 'all' }]}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Clean up' })
      ).toBeInTheDocument();
    });

    it('should show the host in deregistering state', () => {
      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          deregisterable
          deregistering
          userAbilities={[{ name: 'all', resource: 'all' }]}
        />
      );

      expect(
        screen.queryByRole('button', { name: 'Clean up' })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('alert', { name: 'Loading' })
      ).toBeInTheDocument();
    });

    it('should request a deregistration when the clean up button in the modal is clicked', async () => {
      const user = userEvent.setup();
      const { hostname } = hostFactory.build();
      const mockCleanUp = jest.fn();

      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          deregisterable
          hostname={hostname}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          cleanUpHost={mockCleanUp}
        />
      );

      const cleanUpButton = screen.getByRole('button', { name: 'Clean up' });
      await user.click(cleanUpButton);

      expect(
        screen.getByText(
          `Clean up data discovered by agent on host ${hostname}`
        )
      ).toBeInTheDocument();

      const cleanUpModalButton = screen.getAllByRole('button', {
        name: 'Clean up',
      })[0];
      await user.click(cleanUpModalButton);

      expect(mockCleanUp).toHaveBeenCalled();
    });

    it('should forbid host cleanup', async () => {
      const user = userEvent.setup();
      const { hostname } = hostFactory.build();

      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          deregisterable
          hostname={hostname}
          userAbilities={[]}
        />
      );

      const cleanUpButton = screen.getByText('Clean up').closest('button');

      expect(cleanUpButton).toBeDisabled();

      await user.click(cleanUpButton);

      await user.hover(cleanUpButton);

      expect(
        screen.queryByText('You are not authorized for this action')
      ).toBeVisible();
    });
  });

  describe('saptune', () => {
    it('should show the summary of saptune', () => {
      const saptuneStatus = saptuneStatusFactory.build();
      const {
        package_version: packageVersion,
        configured_version: configuredVersion,
        tuning_state: tuningState,
      } = saptuneStatus;

      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          saptuneStatus={saptuneStatus}
          userAbilities={userAbilities}
        />
      );

      expect(screen.getByText('Package').nextSibling).toHaveTextContent(
        packageVersion
      );

      expect(
        screen.getByText('Configured Version').nextSibling
      ).toHaveTextContent(configuredVersion);

      expect(screen.getByText('Tuning').nextSibling).toHaveTextContent(
        TUNING_VALUES[tuningState]
      );
    });
  });

  describe('SUSE Manager', () => {
    it('should show the summary of SUMA software updates', () => {
      const relevantPatches = faker.number.int(100);
      const upgradablePackages = faker.number.int(100);

      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          softwareUpdatesSettingsSaved
          relevantPatches={relevantPatches}
          upgradablePackages={upgradablePackages}
          userAbilities={userAbilities}
        />
      );

      const relevantPatchesElement = screen
        .getByText(/Relevant Patches/)
        .closest('div');
      const upgradablePackagesElement = screen
        .getByText(/Upgradable Packages/)
        .closest('div');

      expect(relevantPatchesElement).toHaveTextContent(
        relevantPatches.toString()
      );
      expect(upgradablePackagesElement).toHaveTextContent(
        upgradablePackages.toString()
      );
    });

    it('should display software updates showing an error message when no SUMA updates data is available', () => {
      const relevantPatches = undefined;
      const upgradablePackages = undefined;

      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          softwareUpdatesSettingsSaved
          softwareUpdatesErrorMessage="An error message"
          relevantPatches={relevantPatches}
          upgradablePackages={upgradablePackages}
          userAbilities={userAbilities}
        />
      );

      const relevantPatchesElement = screen
        .getByText(/Relevant Patches/)
        .closest('div');
      const upgradablePackagesElement = screen
        .getByText(/Upgradable Packages/)
        .closest('div');

      expect(relevantPatchesElement).toHaveTextContent('An error message');
      expect(upgradablePackagesElement).toHaveTextContent('An error message');
    });

    it('should show the summary of SUMA software updates in a loading state', () => {
      const relevantPatches = faker.number.int(100);
      const upgradablePackages = faker.number.int(100);

      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          softwareUpdatesSettingsSaved
          softwareUpdatesLoading
          relevantPatches={relevantPatches}
          upgradablePackages={upgradablePackages}
          userAbilities={userAbilities}
        />
      );

      expect(screen.getAllByLabelText('Loading')).toHaveLength(1);
    });
  });

  describe('last execution overview', () => {
    it('should be displayed when lastExecution has data inside', () => {
      const passingCount = faker.number.int(100);
      const warningCount = faker.number.int(100);
      const criticalCount = faker.number.int(100);

      const lastExecution = {
        data: {
          completed_at: faker.date.past().toISOString(),
          passing_count: passingCount,
          warning_ccount: warningCount,
          critical_ccount: criticalCount,
        },
      };

      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          lastExecution={lastExecution}
          userAbilities={userAbilities}
        />
      );

      expect(screen.getByText(passingCount)).toBeInTheDocument();
    });

    it('should display nothing if lastExecution is an empty object', () => {
      renderWithRouter(
        <HostDetails agentVersion="2.0.0" userAbilities={userAbilities} />
      );

      expect(
        screen.getByText('No check results available.')
      ).toBeInTheDocument();
    });
  });

  describe('operations', () => {
    it.each`
      scenario            | runningOperation
      ${'Saptune apply'}  | ${{ operation: SAPTUNE_SOLUTION_APPLY, menuEntry: 'Apply Saptune Solution' }}
      ${'Saptune change'} | ${{ operation: SAPTUNE_SOLUTION_CHANGE, menuEntry: 'Change Saptune Solution' }}
    `(
      'should show $scenario operation running',
      async ({ runningOperation: { operation, menuEntry } }) => {
        const user = userEvent.setup();

        renderWithRouter(
          <HostDetails
            agentVersion="2.0.0"
            userAbilities={userAbilities}
            operationsEnabled
            runningOperation={{ operation }}
          />
        );

        const operationsButton = screen.getByRole('button', {
          name: 'Operations',
        });

        await act(async () => user.click(operationsButton));

        const menuItem = screen.getByRole('menuitem', {
          name: menuEntry,
        });

        expect(menuItem).toBeDisabled();

        const { getByTestId } = within(menuItem);

        expect(getByTestId('eos-svg-component')).toBeInTheDocument();
      }
    );

    it.each`
      operation
      ${'Apply Saptune Solution'}
      ${'Change Saptune Solution'}
    `('should show $operation operation disabled', async ({ operation }) => {
      const user = userEvent.setup();

      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          userAbilities={userAbilities}
          operationsEnabled
        />
      );

      const operationsButton = screen.getByRole('button', {
        name: 'Operations',
      });
      await act(async () => user.click(operationsButton));

      await waitFor(() =>
        expect(screen.getByRole('menuitem', { name: operation })).toBeDisabled()
      );
    });

    it.each`
      scenario                     | operation                  | expectedMessage
      ${'Saptune apply solution'}  | ${SAPTUNE_SOLUTION_APPLY}  | ${'Unable to run Apply Saptune Solution operation'}
      ${'Saptune change solution'} | ${SAPTUNE_SOLUTION_CHANGE} | ${'Unable to run Change Saptune Solution operation'}
    `(
      'should show $scenario operation forbidden message',
      async ({ operation, expectedMessage }) => {
        const user = userEvent.setup();
        const mockCleanForbiddenOperation = jest.fn();

        renderWithRouter(
          <HostDetails
            agentVersion="2.0.0"
            userAbilities={userAbilities}
            operationsEnabled
            runningOperation={{
              operation,
              forbidden: true,
              errors: ['error1', 'error2'],
            }}
            cleanForbiddenOperation={mockCleanForbiddenOperation}
          />
        );

        expect(screen.getByText('Operation Forbidden')).toBeInTheDocument();
        expect(
          screen.getByText(expectedMessage, { exact: false })
        ).toBeInTheDocument();
        expect(screen.getByText('error1')).toBeInTheDocument();
        expect(screen.getByText('error2')).toBeInTheDocument();

        const closeButton = screen.getByRole('button', {
          name: 'Close',
        });
        await user.click(closeButton);
        expect(mockCleanForbiddenOperation).toHaveBeenCalled();
      }
    );
  });

  describe('forbidden actions', () => {
    it('should disable start execution button when the user abilities are not compatible', async () => {
      const user = userEvent.setup();
      const selectedChecks = [faker.animal.bear(), faker.animal.bear()];

      renderWithRouter(
        <HostDetails
          agentVersion="1.0.0"
          selectedChecks={selectedChecks}
          userAbilities={[{ name: 'all', resource: 'another_resource' }]}
        />
      );

      const startExecutionButton = screen.getByText('Start Execution');
      expect(startExecutionButton).toBeDisabled();

      await user.hover(startExecutionButton);
      expect(
        screen.queryByText('You are not authorized for this action')
      ).toBeInTheDocument();
    });

    it('should enable execution button when the user abilities are compatible', () => {
      const selectedChecks = [faker.animal.bear(), faker.animal.bear()];

      renderWithRouter(
        <HostDetails
          agentVersion="1.0.0"
          selectedChecks={selectedChecks}
          userAbilities={[{ name: 'all', resource: 'host_checks_execution' }]}
        />
      );

      const startExecutionButton = screen.getByText('Start Execution');
      expect(startExecutionButton).toBeEnabled();
    });

    it.each`
      scenario                    | ability                                                  | enabledSolution | operationName            | expectedToBeEnabled
      ${'disable Saptune apply'}  | ${{ name: 'all', resource: 'another_resource' }}         | ${null}         | ${applySaptuneSolution}  | ${false}
      ${'disable Saptune change'} | ${{ name: 'all', resource: 'another_resource' }}         | ${'HANA'}       | ${changeSaptuneSolution} | ${false}
      ${'enable Saptune apply'}   | ${{ name: 'saptune_solution_apply', resource: 'host' }}  | ${null}         | ${applySaptuneSolution}  | ${true}
      ${'enable Saptune change'}  | ${{ name: 'saptune_solution_change', resource: 'host' }} | ${'HANA'}       | ${changeSaptuneSolution} | ${true}
    `(
      'should $scenario solution operation button based on user abilities',
      async ({
        ability,
        enabledSolution,
        operationName,
        expectedToBeEnabled,
      }) => {
        const user = userEvent.setup();
        const saptuneStatus = saptuneStatusFactory.build({
          enabled_solution: enabledSolution,
        });
        const sapInstances = databaseInstanceFactory
          .buildList(1)
          .map((instance) => ({ ...instance, type: DATABASE_TYPE }));

        await act(async () => {
          renderWithRouter(
            <HostDetails
              agentVersion="2.0.0"
              userAbilities={[ability]}
              operationsEnabled
              sapInstances={sapInstances}
              saptuneStatus={saptuneStatus}
            />
          );
        });

        const operationsButton = screen.getByRole('button', {
          name: 'Operations',
        });
        await act(async () => {
          await user.click(operationsButton);
        });

        const menuButton = await waitFor(() =>
          screen.getByRole('menuitem', {
            name: operationName,
          })
        );

        expectedToBeEnabled
          ? expect(menuButton).toBeEnabled()
          : expect(menuButton).toBeDisabled();
      }
    );
  });

  describe('exporters', () => {
    it.each([
      {
        state: 'passing',
        label: 'running',
      },
      {
        state: 'critical',
        label: 'not running',
      },
    ])('should show exporters state as $state', ({ state, label }) => {
      renderWithRouter(
        <HostDetails
          agentVersion="1.0.0"
          userAbilities={userAbilities}
          exportersStatus={{ node_exporter: state }}
        />
      );

      expect(
        screen.getByText(new RegExp(`Node Exporter:.*${label}`), {
          exact: false,
        })
      ).toBeVisible();
    });
  });
});
