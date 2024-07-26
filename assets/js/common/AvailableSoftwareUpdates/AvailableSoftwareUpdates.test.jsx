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
        settingsConfigured
        relevantPatches={0}
        upgradablePackages={upgradablePackages}
      />
    );

    expect(screen.getByText('0')).toBeVisible();
    expect(screen.getByText(upgradablePackages)).toBeVisible();
    expect(screen.getAllByTestId('eos-svg-component')).toHaveLength(4);
  });

  it('renders critical counters', () => {
    const relevantPatches = faker.number.int({ min: 1 });
    const upgradablePackages = faker.number.int();

    render(
      <AvailableSoftwareUpdates
        settingsConfigured
        relevantPatches={relevantPatches}
        upgradablePackages={upgradablePackages}
      />
    );

    expect(screen.getByText(relevantPatches)).toBeVisible();
    expect(screen.getByText(upgradablePackages)).toBeVisible();
    expect(screen.getAllByTestId('eos-svg-component')).toHaveLength(5);
  });

  it('renders error status', async () => {
    const user = userEvent.setup();
    const tooltip = faker.lorem.words({ min: 3, max: 5 });
    const errorMessage = faker.person.jobType();
    render(
      <AvailableSoftwareUpdates
        settingsConfigured
        tooltip={tooltip}
        errorMessage={errorMessage}
      />
    );

    expect(screen.getAllByText(errorMessage)).toHaveLength(2);
    expect(screen.getAllByTestId('eos-svg-component')).toHaveLength(4);

    await user.hover(screen.getAllByText(errorMessage)[0]);
    expect(screen.getByText(tooltip)).toBeInTheDocument();
  });

  it('renders Software Updates Settings Loading status', () => {
    render(<AvailableSoftwareUpdates settingsConfigured loading />);

    expect(screen.getAllByLabelText('Loading')).toHaveLength(1);
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
});
