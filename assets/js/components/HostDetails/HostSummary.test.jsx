import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithRouter } from '@lib/test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { clusterFactory } from '@lib/test-utils/factories';
import HostSummary from './HostSummary';

describe('HostSummary', () => {
  it('should render the content correctly', async () => {
    const cluster = clusterFactory.build();
    const { name: clusterName } = cluster;
    const agentVersion = faker.system.semver();
    const ipAddresses = [
      faker.internet.ipv4(),
      faker.internet.ipv4(),
      faker.internet.ipv4(),
    ];
    const expextedIpAddresses = ipAddresses.join(', ');

    renderWithRouter(
      <HostSummary
        agentVersion={agentVersion}
        cluster={cluster}
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
      expextedIpAddresses
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

  it('should render an icon if there are more than 3 ip addresses', () => {
    const cluster = clusterFactory.build();
    const { name: clusterName } = cluster;
    const agentVersion = faker.system.semver();
    const ipAddresses = [faker.internet.ipv4(), faker.internet.ipv4()];
    const expextedIpAddresses = ipAddresses.join(', ');

    renderWithRouter(
      <HostSummary
        agentVersion={agentVersion}
        cluster={cluster}
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
      expextedIpAddresses
    );

    const tooltipIcon = screen.queryByTestId('eos-svg-component');
    expect(tooltipIcon).toBeNull();
  });
});
