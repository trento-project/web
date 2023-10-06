import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import SaptuneServiceStatus from './SaptuneServiceStatus';

describe('SaptuneServiceStatus', () => {
  it.each([
    {
      service: { name: 'saptune', enabled: 'enabled', active: 'active' },
      icon: 'fill-jungle-green-500',
    },
    {
      service: { name: 'saptune', enabled: 'enabled', active: 'inactive' },
      icon: 'fill-yellow-500',
    },
    {
      service: {
        name: 'saptune',
        enabled: 'disabled',
        active: 'active',
      },
      icon: 'fill-yellow-500',
    },
    {
      service: {
        name: 'saptune',
        enabled: 'disabled',
        active: 'inactive',
      },
      icon: 'fill-red-500',
    },
    {
      service: {
        name: 'sapconf',
        enabled: 'enabled',
        active: 'active',
      },
      icon: 'fill-red-500',
    },
    {
      service: {
        name: 'sapconf',
        enabled: 'enabled',
        active: 'inactive',
      },
      icon: 'fill-yellow-500',
    },
    {
      service: {
        name: 'sapconf',
        enabled: 'disabled',
        active: 'active',
      },
      icon: 'fill-red-500',
    },
    {
      service: {
        name: 'sapconf',
        enabled: 'disabled',
        active: 'inactive',
      },
      icon: 'fill-jungle-green-500',
    },
    {
      service: {
        name: 'tuned',
        enabled: 'enabled',
        active: 'active',
      },
      icon: 'fill-yellow-500',
    },
    {
      service: {
        name: 'tuned',
        enabled: 'enabled',
        active: 'inactive',
      },
      icon: 'fill-yellow-500',
    },
    {
      service: {
        name: 'tuned',
        enabled: 'disabled',
        active: 'active',
      },
      icon: 'fill-yellow-500',
    },
    {
      service: {
        name: 'tuned',
        enabled: 'disabled',
        active: 'inactive',
      },
      icon: 'fill-jungle-green-500',
    },
  ])(
    'should render the service and icon properly for service $service.name',
    ({ service, icon }) => {
      const customService = { ...service };

      renderWithRouter(
        <SaptuneServiceStatus
          service={customService}
          enabled={customService.enabled}
          active={customService.active}
        />
      );

      const serviceStatusIcons = screen.getByTestId('eos-svg-component');
      expect(serviceStatusIcons).toBeInTheDocument();
      expect(serviceStatusIcons).toHaveClass(icon);
    }
  );
});
