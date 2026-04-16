import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithRouter } from '@lib/test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { clusterFactory } from '@lib/test-utils/factories';
import HostSummary from './HostSummary';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';

describe('HostSummary', () => {
  it('should render the content correctly', () => {
    const cluster = clusterFactory.build();
    const { name: clusterName } = cluster;
    const agentVersion = faker.system.semver();
    const ipAddresses = [faker.internet.ipv4(), faker.internet.ipv4()];
    const expectedIpAddresses = ipAddresses.join(', ');
    const arch = faker.helpers.arrayElement(['x86_64', 'ppc64le', 's390x']);

    renderWithRouter(
      <HostSummary
        arch={arch}
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

    expect(screen.getByText('Architecture').nextSibling.textContent).toBe(arch);

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
    const arch = faker.helpers.arrayElement(['x86_64', 'ppc64le', 's390x']);
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

  it('should display last boot timestamp in GMT format', () => {
    const cluster = clusterFactory.build();
    const agentVersion = faker.system.semver();
    const ipAddresses = [faker.internet.ipv4()];
    const arch = faker.helpers.arrayElement(['x86_64', 'ppc64le', 's390x']);
    const lastBootTimestamp = '2024-01-10T07:30:00Z';
    const expectedLastBoot = '10 Jan 2024, 07:30:00';

    renderWithRouter(
      <HostSummary
        arch={arch}
        agentVersion={agentVersion}
        cluster={cluster}
        ipAddresses={ipAddresses}
        lastBootTimestamp={lastBootTimestamp}
        timezone={DEFAULT_TIMEZONE}
      />
    );

    expect(screen.getByText('Last Boot').nextSibling.textContent).toBe(
      expectedLastBoot
    );
  });

  it('should display last boot timestamp using a non-default timezone', () => {
    const cluster = clusterFactory.build();
    const lastBootTimestamp = '2024-01-10T23:30:00Z';

    renderWithRouter(
      <HostSummary
        arch={faker.helpers.arrayElement(['x86_64', 'ppc64le', 's390x'])}
        agentVersion={faker.system.semver()}
        cluster={cluster}
        ipAddresses={[faker.internet.ipv4()]}
        lastBootTimestamp={lastBootTimestamp}
        timezone="Pacific/Kiritimati"
      />
    );

    // UTC+14 shifts this timestamp to the next day: 10 Jan -> 11 Jan.
    expect(screen.getByText('Last Boot').nextSibling.textContent).toBe(
      '11 Jan 2024, 13:30:00'
    );
  });

  it('should display N/A when last boot timestamp is not provided', () => {
    const cluster = clusterFactory.build();
    const agentVersion = faker.system.semver();
    const ipAddresses = [faker.internet.ipv4()];
    const arch = faker.helpers.arrayElement(['x86_64', 'ppc64le', 's390x']);

    renderWithRouter(
      <HostSummary
        arch={arch}
        agentVersion={agentVersion}
        cluster={cluster}
        ipAddresses={ipAddresses}
        lastBootTimestamp={null}
      />
    );

    expect(screen.getByText('Last Boot').nextSibling.textContent).toBe('N/A');
  });

  it('should display N/A when last boot timestamp is undefined', () => {
    const cluster = clusterFactory.build();
    const agentVersion = faker.system.semver();
    const ipAddresses = [faker.internet.ipv4()];
    const arch = faker.helpers.arrayElement(['x86_64', 'ppc64le', 's390x']);

    renderWithRouter(
      <HostSummary
        arch={arch}
        agentVersion={agentVersion}
        cluster={cluster}
        ipAddresses={ipAddresses}
      />
    );

    expect(screen.getByText('Last Boot').nextSibling.textContent).toBe('N/A');
  });
});
