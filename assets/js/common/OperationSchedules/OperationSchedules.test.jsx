// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import OperationSchedules from './OperationSchedules';

const weeklySchedule = {
  id: 'f3a9d3c6-61a3-4c8e-8a3b-3f0e2d3c1b2a',
  target_type: 'host',
  operation: 'reboot',
  params: {},
  starts_at: '2026-11-21T02:00:00.000000Z',
  timezone: 'Europe/Berlin',
  recurrence: {
    frequency: 'weekly',
    interval: 2,
    weekdays: [6, 7],
    max_occurrences: 5,
  },
  next_run_at: '2026-11-28T02:00:00.000000Z',
};

describe('OperationSchedules', () => {
  it('should list the scheduled operations in the user timezone', () => {
    render(
      <OperationSchedules
        schedules={[weeklySchedule]}
        timezone="Europe/Berlin"
      />
    );

    expect(screen.getByText('Scheduled Operations')).toBeVisible();
    expect(screen.getByText('Reboot host')).toBeVisible();
    expect(screen.getByText('28 Nov 2026, 03:00:00')).toBeVisible();
    expect(
      screen.getByText(
        'Every 2 weeks on Saturdays, Sundays at 03:00 AM, 5 times'
      )
    ).toBeVisible();
  });

  it('should open a schedule to change it', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    render(
      <OperationSchedules
        schedules={[weeklySchedule]}
        timezone="Europe/Berlin"
        onEdit={onEdit}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));
    expect(onEdit).toHaveBeenCalledWith(weeklySchedule);
  });

  it('should cancel a schedule after a confirmation', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <OperationSchedules
        schedules={[weeklySchedule]}
        timezone="Europe/Berlin"
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel schedule' }));
    expect(onCancel).not.toHaveBeenCalled();
    expect(
      screen.getByText('Cancel the schedule of Reboot host?')
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Yes, cancel it' }));
    expect(onCancel).toHaveBeenCalledWith(weeklySchedule.id);
  });

  it('should not allow changes without the ability', () => {
    render(
      <OperationSchedules
        schedules={[weeklySchedule]}
        timezone="Europe/Berlin"
        canChange={false}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Edit schedule' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Cancel schedule' })
    ).toBeDisabled();
  });

  it('should render nothing without schedules', () => {
    const { container } = render(<OperationSchedules schedules={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
