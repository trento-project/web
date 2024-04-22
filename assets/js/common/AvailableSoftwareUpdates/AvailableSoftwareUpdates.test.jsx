import React from 'react';
import { faker } from '@faker-js/faker';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import AvailableSoftwareUpdates from '.';

describe('AvailableSoftwareUpdates component', () => {
  it('renders non critical counters', () => {
    const upgradablePackages = faker.number.int();

    render(
      <AvailableSoftwareUpdates
        relevantPatches={0}
        upgradablePackages={upgradablePackages}
        settingsConfigured
      />
    );

    expect(screen.getByText('0')).toBeVisible();
    expect(screen.getByText(upgradablePackages)).toBeVisible();
    expect(screen.getAllByTestId('eos-svg-component')).toHaveLength(2);
  });

  it('renders critical counters', () => {
    const relevantPatches = faker.number.int({ min: 1 });
    const upgradablePackages = faker.number.int();

    render(
      <AvailableSoftwareUpdates
        relevantPatches={relevantPatches}
        upgradablePackages={upgradablePackages}
        settingsConfigured
      />
    );

    expect(screen.getByText(relevantPatches)).toBeVisible();
    expect(screen.getByText(upgradablePackages)).toBeVisible();
    expect(screen.getAllByTestId('eos-svg-component')).toHaveLength(3);
  });

  it('renders Unknown status', async () => {
    const user = userEvent.setup();
    const tooltip = faker.lorem.words({ min: 3, max: 5 });
    render(<AvailableSoftwareUpdates tooltip={tooltip} settingsConfigured />);

    expect(screen.getAllByText('Unknown')).toHaveLength(2);
    expect(screen.getAllByTestId('eos-svg-component')).toHaveLength(4);

    await user.hover(screen.getAllByText('Unknown')[0]);
    expect(screen.getByText(tooltip)).toBeInTheDocument();
  });

  it('renders Loading status', () => {
    render(<AvailableSoftwareUpdates loading settingsConfigured />);

    expect(screen.getAllByText('Loading...')).toHaveLength(2);
  });

  it('renders "SUSE Manager is not configured"', () => {
    render(<AvailableSoftwareUpdates settingsConfigured={false} />);

    expect(
      screen.getByText(
        'SUSE Manager is not configured. Go to Settings to add your SUSE Manager connection credentials.'
      )
    ).toBeVisible();

    expect(screen.getByRole('button', { name: 'Settings' })).toBeVisible();
  });

  it('renders a connection error', () => {
    render(<AvailableSoftwareUpdates settingsConfigured connectionError />);

    expect(screen.getAllByText('SUSE Manager connection failed')).toHaveLength(
      2
    );
  });
});
