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

  it.each([{ health: 'unhealthy' }, { health: 'healthy' }])(
    'should render sbd device with specified $health health',
    ({ health }) => {
      const sbdDevices = sbdDevicesFactory.buildList(1, { status: health });
      const { device: expectedDeviceName } = sbdDevices[0];

      render(<SBDDetails sbdDevices={sbdDevices} />);

      expect(screen.getByText(expectedDeviceName)).toBeTruthy();
      expect(screen.getByText(capitalize(health))).toBeTruthy();
    }
  );

  it('should render multiple devices and their status', () => {
    const expectedSBD = [
      sbdDevicesFactory.build({ status: 'unhealthy' }),
      sbdDevicesFactory.build({ status: 'healthy' }),
    ];

    render(<SBDDetails sbdDevices={expectedSBD} />);

    expectedSBD.forEach(({ device, status }) => {
      expect(screen.getByText(device)).toBeInTheDocument();
      expect(screen.getByText(capitalize(status))).toBeInTheDocument();
    });
  });
});
