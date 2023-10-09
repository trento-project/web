import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import SaptuneServiceStatus from './SaptuneServiceStatus';

describe('SaptuneServiceStatus', () => {
  it.each([
    {
      serviceName: 'saptune',
      enabled: 'enabled',
      active: 'active',
      icon: 'fill-jungle-green-500',
    },
    {
      serviceName: 'saptune',
      enabled: 'enabled',
      active: 'inactive',
      icon: 'fill-yellow-500',
    },
    {
      serviceName: 'saptune',
      enabled: 'disabled',
      active: 'active',
      icon: 'fill-yellow-500',
    },
    {
      serviceName: 'saptune',
      enabled: 'disabled',
      active: 'inactive',
      icon: 'fill-red-500',
    },
    {
      serviceName: 'sapconf',
      enabled: 'enabled',
      active: 'active',
      icon: 'fill-red-500',
    },
    {
      serviceName: 'sapconf',
      enabled: 'enabled',
      active: 'inactive',
      icon: 'fill-yellow-500',
    },
    {
      serviceName: 'sapconf',
      enabled: 'disabled',
      active: 'active',
      icon: 'fill-red-500',
    },
    {
      serviceName: 'sapconf',
      enabled: 'disabled',
      active: 'inactive',
      icon: 'fill-jungle-green-500',
    },
    {
      serviceName: 'tuned',
      enabled: 'enabled',
      active: 'active',
      icon: 'fill-yellow-500',
    },
    {
      serviceName: 'tuned',
      enabled: 'enabled',
      active: 'inactive',
      icon: 'fill-yellow-500',
    },
    {
      serviceName: 'tuned',
      enabled: 'disabled',
      active: 'active',
      icon: 'fill-yellow-500',
    },
    {
      serviceName: 'tuned',
      enabled: 'disabled',
      active: 'inactive',
      icon: 'fill-jungle-green-500',
    },
  ])(
    'should render the service and icon properly for service $service.serviceName',
    ({ serviceName, enabled, active, icon }) => {
      renderWithRouter(
        <SaptuneServiceStatus
          serviceName={serviceName}
          enabled={enabled}
          active={active}
        />
      );

      const serviceStatusIcons = screen.getByTestId('eos-svg-component');
      expect(serviceStatusIcons).toBeInTheDocument();
      expect(serviceStatusIcons).toHaveClass(icon);
    }
  );
});
