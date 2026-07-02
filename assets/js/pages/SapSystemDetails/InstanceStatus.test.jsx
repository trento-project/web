// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';

import InstanceStatus from './InstanceStatus';

describe('InstanceStatus Component', () => {
  it.each([
    { status: 'green', cssClass: 'fill-jungle-green-500' },
    { status: 'yellow', cssClass: 'fill-yellow-500' },
    { status: 'red', cssClass: 'fill-red-500' },
    { status: 'gray', cssClass: 'fill-gray-500' },
  ])(
    'should render $status status icon with $cssClass',
    ({ status, cssClass }) => {
      render(<InstanceStatus status={status} />);

      const icon = screen.getByTestId('eos-svg-component');
      expect(icon).toHaveClass(cssClass);
    }
  );

  it('should render an absent instance with black icon', () => {
    render(<InstanceStatus status="green" absent />);

    const icon = screen.getByTestId('eos-svg-component');
    expect(icon).toHaveClass('fill-black');
  });

  it('should render stale badge when staleAt prop is provided', () => {
    const staleDate = faker.date.past().toISOString();
    render(
      <InstanceStatus status="red" staleAt={staleDate} timezone="Etc/UTC" />
    );

    const icons = screen.getAllByTestId('eos-svg-component');
    expect(icons.length).toBe(2);
  });

  it('should not render stale badge when staleAt prop is not provided', () => {
    render(<InstanceStatus status="green" />);

    const icons = screen.getAllByTestId('eos-svg-component');
    expect(icons.length).toBe(1);
  });

  it('should display tooltip with stale information on hover', async () => {
    const user = userEvent.setup();
    const staleDate = '2024-06-12T13:05:10Z';
    render(
      <InstanceStatus status="red" staleAt={staleDate} timezone="Etc/UTC" />
    );

    const icon = screen.getAllByTestId('eos-svg-component')[0];
    await user.hover(icon);

    expect(screen.queryByText(/Red/)).toBeInTheDocument();
    expect(
      screen.queryByText(/\(Stale since 12 Jun 2024, 13:05:10\)/)
    ).toBeInTheDocument();
  });
});
