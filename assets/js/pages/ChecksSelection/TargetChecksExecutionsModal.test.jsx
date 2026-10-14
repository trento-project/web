// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import TargetChecksExecutionsModal from './TargetChecksExecutionsModal';

const schedule = {
  interval: null,
  effective_interval: 15,
  global_interval: 15,
  exception_window: null,
};

describe('TargetChecksExecutionsModal', () => {
  it('should save an interval and a periodic exception window', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(
      <TargetChecksExecutionsModal
        open
        schedule={schedule}
        timezone="Europe/Berlin"
        onSave={onSave}
      />
    );

    expect(screen.getByText('Check Executions Settings')).toBeVisible();

    await user.click(screen.getByText('System setting'));
    await user.click(screen.getByRole('option', { name: 'Hours' }));

    await user.click(screen.getByText('None'));
    await user.click(screen.getByRole('option', { name: 'Periodic' }));

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-10-13' },
    });
    fireEvent.change(screen.getByLabelText('Start Time'), {
      target: { value: '00:00' },
    });

    await user.click(screen.getByText('Days'));
    await user.click(screen.getByRole('option', { name: 'Weeks' }));

    await user.click(screen.getByText('Select days'));
    await user.click(screen.getByRole('option', { name: 'Monday' }));
    // jsdom closes the menu after a selection, reopen it from the selected day
    await user.click(screen.getByText('Monday'));
    await user.click(screen.getByRole('option', { name: 'Friday' }));

    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(onSave).toHaveBeenCalledWith({
      interval: 60,
      exception_window: {
        starts_at: '2026-10-12T22:00:00.000Z',
        duration: 60,
        timezone: 'Europe/Berlin',
        frequency: 'weekly',
        interval: 1,
        weekdays: [1, 5],
      },
    });
  });

  it('should reset the interval and remove the exception window', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(
      <TargetChecksExecutionsModal
        open
        schedule={{
          ...schedule,
          interval: 60,
          effective_interval: 60,
          exception_window: {
            starts_at: '2026-10-13T10:00:00Z',
            duration: 30,
            timezone: 'Etc/UTC',
            frequency: null,
            interval: 1,
            weekdays: [],
          },
        }}
        timezone="Etc/UTC"
        onSave={onSave}
      />
    );

    expect(screen.getByLabelText('Date')).toHaveValue('2026-10-13');
    expect(screen.getByLabelText('Start Time')).toHaveValue('10:00');

    await user.click(screen.getByText('Hours'));
    await user.click(screen.getByRole('option', { name: 'System setting' }));

    await user.click(screen.getByText('One Time'));
    await user.click(screen.getByRole('option', { name: 'None' }));

    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(onSave).toHaveBeenCalledWith({
      interval: null,
      exception_window: null,
    });
  });

  it('should close without saving', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    const onCancel = jest.fn();

    render(
      <TargetChecksExecutionsModal
        open
        schedule={schedule}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onCancel).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
