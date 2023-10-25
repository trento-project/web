import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithRouter } from '@lib/test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { clusterFactory } from '@lib/test-utils/factories';
import HostSummary from './HostSummary';

describe('HostSummary', () => {
  it('should render the content correctly', () => {
    const cluster = clusterFactory.build();
    const { name: clusterName } = cluster;
    const agentVersion = faker.system.semver();
    const ipAddresses = [faker.internet.ipv4(), faker.internet.ipv4()];
    const expectedIpAddresses = ipAddresses.join(', ');

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
      expectedIpAddresses
    );
  });

  it('should render an icon if there are 3 or more ip addresses', async () => {
    const ipAddresses = [
      faker.internet.ipv4(),
      faker.internet.ipv4(),
      faker.internet.ipv4(),
    ];
    const expectedIpAddresses = ipAddresses.join(', ');
    renderWithRouter(
      <HostSummary
        agentVersion={faker.system.semver()}
        cluster={clusterFactory.build()}
        ipAddresses={ipAddresses}
      />
    );

    expect(screen.getByText('IP addresses').nextSibling.textContent).toBe(
      expectedIpAddresses
    );

    const tooltipIcon = screen.queryByTestId('eos-svg-component');
    await act(async () => userEvent.hover(tooltipIcon));
    const tooltipContentDiv = screen.getByRole('tooltip');
    expect(tooltipContentDiv).toBeVisible();
    waitFor(() =>
      ipAddresses.forEach((ipAddress) => {
        expect(tooltipContentDiv).toHaveTextContent(ipAddress);
      })
    );
  });
});
