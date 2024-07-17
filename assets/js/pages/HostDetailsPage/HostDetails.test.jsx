import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { renderWithRouter } from '@lib/test-utils';
import { hostFactory, saptuneStatusFactory } from '@lib/test-utils/factories';
import { TUNING_VALUES } from '@pages/SaptuneDetails/SaptuneDetails.test';

import HostDetails from './HostDetails';

const axiosMock = new MockAdapter(networkClient);
const userAbilities = [{ name: 'all', resource: 'all' }];

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
          suseManagerEnabled
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

    it("should display software updates as 'Unknown' when no SUMA updates data is available", () => {
      const relevantPatches = undefined;
      const upgradablePackages = undefined;

      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          suseManagerEnabled
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

      expect(relevantPatchesElement).toHaveTextContent('Unknown');
      expect(upgradablePackagesElement).toHaveTextContent('Unknown');
    });

    it('should show the summary of SUMA software updates in a loading state', () => {
      const relevantPatches = faker.number.int(100);
      const upgradablePackages = faker.number.int(100);

      renderWithRouter(
        <HostDetails
          agentVersion="2.0.0"
          suseManagerEnabled
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
  });
});
