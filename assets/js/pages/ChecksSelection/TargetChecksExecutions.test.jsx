// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import TargetChecksExecutions from './TargetChecksExecutions';

const adminAbilities = [{ name: 'all', resource: 'all' }];

const schedule = {
  interval: null,
  effective_interval: 15,
  global_interval: 15,
  exception_window: null,
};

describe('TargetChecksExecutions', () => {
  it('should show the frequency and the exception window of a host', async () => {
    const user = userEvent.setup();
    const onEditClick = jest.fn();

    render(
      <TargetChecksExecutions
        targetType="host"
        schedule={schedule}
        userAbilities={adminAbilities}
        permittedFor={['all:host_checks_selection']}
        onEditClick={onEditClick}
      />
    );

    expect(screen.getByText('Host Check Executions')).toBeVisible();
    expect(
      screen.getByText('Configure when health checks are run for this host.')
    ).toBeVisible();
    expect(screen.getByText('Every 15 minutes')).toBeVisible();
    expect(screen.getByText('None')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Edit Settings' }));
    expect(onEditClick).toHaveBeenCalled();
  });

  it('should show an interval overriding the system setting and a recurring window', () => {
    render(
      <TargetChecksExecutions
        targetType="cluster"
        schedule={{
          ...schedule,
          interval: 360,
          effective_interval: 360,
          exception_window: {
            starts_at: '2026-10-12T22:00:00Z',
            duration: 60,
            timezone: 'Europe/Berlin',
            frequency: 'weekly',
            interval: 1,
            weekdays: [1, 5],
          },
        }}
        timezone="Europe/Berlin"
        userAbilities={adminAbilities}
      />
    );

    expect(screen.getByText('Cluster Check Executions')).toBeVisible();
    expect(screen.getByText('Every 6 hours')).toBeVisible();
    expect(
      screen.getByText('(Overrides system setting: 15 minutes)')
    ).toBeVisible();
    expect(
      screen.getByText('Mondays, Fridays, 12:00 AM – 01:00 AM')
    ).toBeVisible();
  });

  it('should explain the exception window', async () => {
    const user = userEvent.setup();

    render(
      <TargetChecksExecutions
        targetType="host"
        schedule={schedule}
        userAbilities={adminAbilities}
      />
    );

    await user.hover(screen.getByLabelText('exception-window-info'));
    expect(
      screen.getByText('Configure when checks should not be run.')
    ).toBeVisible();
  });

  it('should not allow editing without permission', () => {
    render(
      <TargetChecksExecutions
        targetType="host"
        schedule={schedule}
        userAbilities={[]}
        permittedFor={['all:host_checks_selection']}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Edit Settings' })
    ).toBeDisabled();
  });
});
