// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import OperationSchedules from './OperationSchedules';

const weeklySchedule = {
  id: 'f3a9d3c6-61a3-4c8e-8a3b-3f0e2d3c1b2a',
  operation: 'reboot',
  starts_at: '2026-10-17T01:00:00.000000Z',
  timezone: 'Europe/Berlin',
  frequency: 'weekly',
  interval: 2,
  weekdays: [6, 7],
  ends_on: null,
  max_occurrences: 5,
  next_run_at: '2026-10-24T01:00:00.000000Z',
};

describe('OperationSchedules', () => {
  it('should list the scheduled operations in the user timezone and cancel one', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <OperationSchedules
        schedules={[weeklySchedule]}
        timezone="Europe/Berlin"
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Scheduled Operations')).toBeVisible();
    expect(screen.getByText('Reboot host')).toBeVisible();
    expect(screen.getByText('24 Oct 2026, 03:00:00')).toBeVisible();
    expect(
      screen.getByText(
        'Every 2 weeks on Saturdays, Sundays at 03:00 AM, 5 times'
      )
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Cancel schedule' }));
    expect(onCancel).toHaveBeenCalledWith(weeklySchedule.id);
  });

  it('should show an ended schedule', () => {
    render(
      <OperationSchedules
        schedules={[
          {
            ...weeklySchedule,
            frequency: null,
            interval: 1,
            weekdays: [],
            max_occurrences: null,
            next_run_at: null,
          },
        ]}
        timezone="Europe/Berlin"
      />
    );

    expect(screen.getByText('Ended')).toBeVisible();
    expect(screen.getByText('17 Oct 2026 at 03:00 AM')).toBeVisible();
  });

  it('should render nothing without schedules', () => {
    const { container } = render(<OperationSchedules schedules={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
