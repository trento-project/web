import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithRouter } from '@lib/test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { clusterFactory } from '@lib/test-utils/factories';
import HostClusterAgentIpSummary from './HostClusterAgentIpSummary';

describe('HostClusterAgentIpSummary', () => {
  it('should render correct cluster name, agent version, ip addresses and a tooltip', async () => {
    const clusterName = faker.animal.cat();
    const cluster = clusterFactory.build({ name: clusterName });
    const agentVersion = faker.system.semver();
    const ipAddresses = [
      faker.internet.ipv4(),
      faker.internet.ipv4(),
      faker.internet.ipv4(),
      faker.internet.ipv4(),
      faker.internet.ipv4(),
    ];
    const expextedIpAdresses = ipAddresses.join(',');

    renderWithRouter(
      <HostClusterAgentIpSummary
        cluster={cluster}
        agentVersion={agentVersion}
        ipAddresses={ipAddresses}
      />
    );

    expect(screen.getByText('Cluster').nextSibling.textContent).toBe(
      clusterName
    );
    expect(screen.getByText('Agent Version').nextSibling.textContent).toBe(
      agentVersion
    );
    expect(screen.getByText('IP addresses').nextSibling.textContent).toBe(
      expextedIpAdresses
    );

    const tooltipIcon = screen.getByTestId('eos-svg-component');
    await act(async () => userEvent.hover(tooltipIcon));

    const tooltipContentDiv = screen.getByRole('tooltip');
    expect(tooltipContentDiv).toBeVisible();
    await waitFor(() =>
      ipAddresses.forEach((ipAddress) => {
        expect(tooltipContentDiv).toHaveTextContent(ipAddress);
      })
    );
  });

  it('should render summary without a tooltip icon as there are fewer than four IPs', async () => {
    const clusterName = faker.animal.cat();
    const cluster = clusterFactory.build({ name: clusterName });
    const agentVersion = faker.system.semver();
    const ipAddresses = [
      faker.internet.ipv4(),
      faker.internet.ipv4(),
      faker.internet.ipv4(),
    ];
    const expextedIpAdresses = ipAddresses.join(',');

    renderWithRouter(
      <HostClusterAgentIpSummary
        cluster={cluster}
        agentVersion={agentVersion}
        ipAddresses={ipAddresses}
      />
    );

    expect(screen.getByText('Cluster').nextSibling.textContent).toBe(
      clusterName
    );
    expect(screen.getByText('Agent Version').nextSibling.textContent).toBe(
      agentVersion
    );
    expect(screen.getByText('IP addresses').nextSibling.textContent).toBe(
      expextedIpAdresses
    );

    const tooltipIcon = screen.queryByTestId('eos-svg-component');
    expect(tooltipIcon).toBeNull();
  });
});
