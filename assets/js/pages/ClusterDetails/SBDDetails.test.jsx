import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';

import { capitalize } from 'lodash';

import SBDDetails from './SBDDetails';

describe('SBDDetails', () => {
  it('should show empty  message', () => {
    const expectedEmptyStateMsg = 'No additional fencing details to display.';
    const sbdDevices = [];

    render(<SBDDetails sbdDevices={sbdDevices} />);
    expect(screen.getByText(expectedEmptyStateMsg)).toBeInTheDocument();
  });

  it('should show healthy sbd device', () => {
    const expectedDeviceName = faker.system.filePath();
    const expectedHealthStatus = 'healthy';
    const formattedHealthStatus = capitalize(expectedHealthStatus);

    const sbdDevices = [
      { device: expectedDeviceName, status: expectedHealthStatus },
    ];
    const { device, status: healthStatus } = sbdDevices[0];

    render(<SBDDetails sbdDevices={sbdDevices} />);

    expect(screen.getByText(device)).toHaveTextContent(expectedDeviceName);
    expect(screen.getByText(formattedHealthStatus)).toHaveTextContent(
      capitalize(healthStatus)
    );
  });

  it('should show unhealthy sbd device', () => {
    const expectedDeviceName = faker.system.filePath();
    const expectedHealthStatus = 'unhealthy';
    const formattedHealthStatus = capitalize(expectedHealthStatus);

    const sbdDevices = [
      { device: expectedDeviceName, status: expectedHealthStatus },
    ];
    const { device, status: healthStatus } = sbdDevices[0];

    render(<SBDDetails sbdDevices={sbdDevices} />);

    expect(screen.getByText(device)).toHaveTextContent(expectedDeviceName);
    expect(screen.getByText(formattedHealthStatus)).toHaveTextContent(
      capitalize(healthStatus)
    );
  });
});
