// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import BulkScheduleModal from './BulkScheduleModal';

describe('BulkScheduleModal', () => {
  it('should schedule an operation on the selected targets', async () => {
    const user = userEvent.setup();
    const onSchedule = jest.fn();

    render(
      <BulkScheduleModal
        isOpen
        operationLabel="Reboot host"
        targetsLabel="3 hosts"
        timezone="Etc/UTC"
        onSchedule={onSchedule}
      />
    );

    expect(screen.getByText('Schedule Reboot host on 3 hosts')).toBeVisible();
    expect(screen.queryByText('Now')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-11-20' },
    });
    fireEvent.change(screen.getByLabelText('Start Time'), {
      target: { value: '03:00' },
    });
    await user.click(screen.getByRole('button', { name: 'Schedule' }));

    expect(onSchedule).toHaveBeenCalledWith({
      starts_at: '2026-11-20T03:00:00.000Z',
      timezone: 'Etc/UTC',
      recurrence: null,
    });
  });

  it('should cancel', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <BulkScheduleModal
        isOpen
        operationLabel="Reboot host"
        targetsLabel="1 host"
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
