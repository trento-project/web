import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';

import { renderWithRouter } from '@lib/test-utils';
import { hostFactory, saptuneStatusFactory } from '@lib/test-utils/factories';

import HostDetails from './HostDetails';

describe('HostDetails component', () => {
  describe('Checks execution', () => {
    it('should show the Checks related action buttons', () => {
      renderWithRouter(<HostDetails agentVersion="1.0.0" />);

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

    it('should disable start execution button when checks are not selected', () => {
      renderWithRouter(
        <HostDetails agentVersion="1.0.0" selectedChecks={[]} />
      );

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      const startExecutionButton = screen.getByText('Start Execution');
      expect(startExecutionButton).toBeDisabled();
    });

    it('should enable start execution button when checks are selected', () => {
      const selectedChecks = [faker.animal.bear(), faker.animal.bear()];

      renderWithRouter(
        <HostDetails agentVersion="1.0.0" selectedChecks={selectedChecks} />
      );

      expect(screen.getByRole('tooltip')).toBeVisible();
      const startExecutionButton = screen.getByText('Start Execution');
      expect(startExecutionButton).toBeEnabled();
    });
  });

  describe('agent version', () => {
    it('should not show any warning message if the agent version is correct', () => {
      renderWithRouter(<HostDetails agentVersion="2.0.0" />);

      expect(
        screen.queryByText(
          'Agent version 2.0.0 or greater is required for the new checks engine.'
        )
      ).not.toBeInTheDocument();
    });

    it('should show 2.0.0 version required warning message', () => {
      renderWithRouter(<HostDetails agentVersion="1.0.0" />);

      expect(
        screen.getByText(
          'Agent version 2.0.0 or greater is required for the new checks engine.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('deregistration', () => {
    it('should not display clean up button when host is not deregisterable', () => {
      renderWithRouter(
        <HostDetails agentVersion="2.0.0" deregisterable={false} />
      );

      expect(
        screen.queryByRole('button', { name: 'Clean up' })
      ).not.toBeInTheDocument();
    });

    it('should display clean up button when host is deregisterable', () => {
      renderWithRouter(<HostDetails agentVersion="2.0.0" deregisterable />);

      expect(
        screen.getByRole('button', { name: 'Clean up' })
      ).toBeInTheDocument();
    });

    it('should show the host in deregistering state', () => {
      renderWithRouter(
        <HostDetails agentVersion="2.0.0" deregisterable deregistering />
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
        <HostDetails agentVersion="2.0.0" saptuneStatus={saptuneStatus} />
      );

      expect(screen.getByText('Package').nextSibling).toHaveTextContent(
        packageVersion
      );

      expect(
        screen.getByText('Configured Version').nextSibling
      ).toHaveTextContent(configuredVersion);

      expect(screen.getByText('Tunning').nextSibling).toHaveTextContent(
        new RegExp(tuningState, 'i')
      );
    });
  });
});
