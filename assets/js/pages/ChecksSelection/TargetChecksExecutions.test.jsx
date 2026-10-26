// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import TargetChecksExecutions from './TargetChecksExecutions';

const abilities = [{ name: 'all', resource: 'all' }];

const schedule = {
  interval: null,
  effective_interval: '15m',
  global_interval: '15m',
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
        userAbilities={abilities}
        onEditClick={onEditClick}
      />
    );

    expect(screen.getByText('Host Check Executions')).toBeVisible();
    expect(screen.getByText('Premium')).toBeVisible();
    expect(screen.getByText('Every 15 minutes')).toBeVisible();
    expect(
      screen.queryByText(/Overrides system setting/)
    ).not.toBeInTheDocument();
    expect(screen.getByText('None')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Edit Settings' }));
    expect(onEditClick).toHaveBeenCalled();
  });

  it('should show a frequency overriding the system setting and a periodic window', () => {
    render(
      <TargetChecksExecutions
        targetType="cluster"
        schedule={{
          ...schedule,
          interval: '6h',
          effective_interval: '6h',
          exception_window: {
            starts_at: '2026-10-12T22:00:00Z',
            timezone: 'Europe/Berlin',
            duration_minutes: 60,
            recurrence: { frequency: 'weekly', interval: 1, weekdays: [1, 5] },
          },
        }}
        timezone="Europe/Berlin"
        userAbilities={abilities}
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

  it('should show disabled periodic executions', () => {
    render(
      <TargetChecksExecutions
        targetType="host"
        schedule={{
          ...schedule,
          interval: 'disabled',
          effective_interval: 'disabled',
        }}
        userAbilities={abilities}
      />
    );

    expect(screen.getByText('Disabled')).toBeVisible();
    expect(
      screen.getByText('(Overrides system setting: 15 minutes)')
    ).toBeVisible();
  });
});
