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
    const arch = faker.helpers.arrayElements(["x86_64", "ppc64le", "s390x"])

    renderWithRouter(
      <HostSummary
        architecture={arch}
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
    expect(screen.getByText('IP Addresses').nextSibling.textContent).toBe(
      expectedIpAddresses
    );

    expect(screen.getByText('Architecture').nextSibling.textContent).toBe(
      arch
    );

    const tooltipIcon = screen.queryByTestId('eos-svg-component');
    expect(tooltipIcon).toBeNull();
  });

  it('should render an icon if there are 3 or more ip addresses', async () => {
    const ipAddresses = [
      faker.internet.ipv4(),
      faker.internet.ipv4(),
      faker.internet.ipv4(),
    ];
    const expectedIpAddresses = ipAddresses.join(', ');
    const arch = faker.helpers.arrayElements(["x86_64", "ppc64le", "s390x"])
    renderWithRouter(
      <HostSummary
        arch={arch}
        agentVersion={faker.system.semver()}
        cluster={clusterFactory.build()}
        ipAddresses={ipAddresses}
      />
    );

    expect(screen.getByText('IP Addresses').nextSibling.textContent).toBe(
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
