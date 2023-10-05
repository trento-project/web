import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import SaptuneServiceStatus from './SaptuneServiceStatus';

describe('SaptuneServiceStatus', () => {
  it.each([
    {
      service: 'saptune',
      enabled: 'enabled',
      active: 'active',
      icon: 'fill-jungle-green-500',
    },
    {
      service: 'saptune',
      enabled: 'enabled',
      active: 'inactive',
      icon: 'fill-yellow-500',
    },
    {
      service: 'saptune',
      enabled: 'disabled',
      active: 'active',
      icon: 'fill-yellow-500',
    },
    {
      service: 'saptune',
      enabled: 'disabled',
      active: 'inactive',
      icon: 'fill-red-500',
    },
    {
      service: 'sapconf',
      enabled: 'enabled',
      active: 'active',
      icon: 'fill-red-500',
    },
    {
      service: 'sapconf',
      enabled: 'enabled',
      active: 'inactive',
      icon: 'fill-yellow-500',
    },
    {
      service: 'sapconf',
      enabled: 'disabled',
      active: 'active',
      icon: 'fill-red-500',
    },
    {
      service: 'sapconf',
      enabled: 'disabled',
      active: 'inactive',
      icon: 'fill-jungle-green-500',
    },
    {
      service: 'tuned',
      enabled: 'enabled',
      active: 'active',
      icon: 'fill-yellow-500',
    },
    {
      service: 'tuned',
      enabled: 'enabled',
      active: 'inactive',
      icon: 'fill-yellow-500',
    },
    {
      service: 'tuned',
      enabled: 'disabled',
      active: 'active',
      icon: 'fill-yellow-500',
    },
    {
      service: 'tuned',
      enabled: 'disabled',
      active: 'inactive',
      icon: 'fill-jungle-green-500',
    },
  ])(
    'should render the service and icon properly for service $service',
    ({ service, enabled, active, icon }) => {
      const customService = {
        active,
        enabled,
        name: service,
      };

      const services = [customService];

      renderWithRouter(
        <SaptuneServiceStatus services={services} serviceName={service} />
      );

      const serviceStatusIcons = screen.getAllByTestId('eos-svg-component');
      expect(serviceStatusIcons).toHaveLength(1);
      expect(serviceStatusIcons[0]).toHaveClass(icon);
    }
  );
});
