import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { sbdDevicesFactory } from '@lib/test-utils/factories';

import { capitalize } from 'lodash';

import SBDDetails from './SBDDetails';

describe('SBDDetails', () => {
  it('should render empty state message when sbd devices are empty', () => {
    const expectedEmptyStateMsg = 'No additional fencing details to display.';
    const sbdDevices = [];

    render(<SBDDetails sbdDevices={sbdDevices} />);
    expect(screen.getByText(expectedEmptyStateMsg)).toBeInTheDocument();
  });

  it('should render healthy sbd device', () => {
    const expectedSBD = sbdDevicesFactory.buildList(1, { status: 'healthy' });
    const [{ device: expectedDeviceName, status: expectedHealthStatus }] =
      expectedSBD;
    const capitalizedHealthStatus = capitalize(expectedHealthStatus);
    render(<SBDDetails sbdDevices={expectedSBD} />);
    expect(screen.getByText(expectedDeviceName)).toHaveTextContent(
      expectedDeviceName
    );
    expect(screen.getByText(capitalizedHealthStatus)).toHaveTextContent(
      capitalize(expectedHealthStatus)
    );
  });

  it('should render unhealthy sbd device', () => {
    const expectedSBD = sbdDevicesFactory.buildList(1, { status: 'unhealthy' });
    const [{ device: expectedDeviceName, status: expectedHealthStatus }] =
      expectedSBD;
    const capitalizedHealthStatus = capitalize(expectedHealthStatus);

    render(<SBDDetails sbdDevices={expectedSBD} />);

    expect(screen.getByText(expectedDeviceName)).toHaveTextContent(
      expectedDeviceName
    );
    expect(screen.getByText(capitalizedHealthStatus)).toHaveTextContent(
      capitalize(expectedHealthStatus)
    );
  });

  it('should render multiple devices and their status', () => {
    const expectedSBD = [
      sbdDevicesFactory.build({ status: 'unhealthy' }),
      sbdDevicesFactory.build({ status: 'healthy' }),
    ];

    render(<SBDDetails sbdDevices={expectedSBD} />);

    expectedSBD.forEach(({ device, status }) => {
      expect(screen.getByText(device)).toBeInTheDocument();
      expect(
        screen.getByText(status === 'healthy' ? 'Healthy' : 'Unhealthy')
      ).toBeInTheDocument();
    });
  });
});
