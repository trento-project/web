// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { waiveOperationDisclaimer } from '@lib/operations';

import OperationModal from './OperationModal';

const setDateAndTime = (date, time) => {
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: date } });
  fireEvent.change(screen.getByLabelText('Start Time'), {
    target: { value: time },
  });
};

describe('OperationModal scheduling', () => {
  beforeAll(() => waiveOperationDisclaimer());

  it('should request the operation now by default', async () => {
    const user = userEvent.setup();
    const onRequest = jest.fn();

    render(
      <OperationModal title="Reboot" isOpen schedulable onRequest={onRequest} />
    );

    expect(screen.getByText('Schedule')).toBeVisible();
    expect(screen.getByText('Premium')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Request' }));
    expect(onRequest).toHaveBeenCalledWith(null);
  });

  it('should schedule a one-time operation in the user timezone', async () => {
    const user = userEvent.setup();
    const onRequest = jest.fn();

    render(
      <OperationModal
        title="Reboot"
        isOpen
        schedulable
        timezone="Europe/Berlin"
        onRequest={onRequest}
      />
    );

    await user.click(screen.getByText('Now'));
    await user.click(screen.getByRole('option', { name: 'One Time' }));
    setDateAndTime('2026-11-20', '03:00');
    await user.click(screen.getByRole('button', { name: 'Schedule' }));

    expect(onRequest).toHaveBeenCalledWith({
      starts_at: '2026-11-20T02:00:00.000Z',
      timezone: 'Europe/Berlin',
      recurrence: null,
    });
  });

  it('should schedule a periodic operation with its end', async () => {
    const user = userEvent.setup();
    const onRequest = jest.fn();

    render(
      <OperationModal
        title="Reboot"
        isOpen
        schedulable
        timezone="Etc/UTC"
        onRequest={onRequest}
      />
    );

    await user.click(screen.getByText('Now'));
    await user.click(screen.getByRole('option', { name: 'Periodic' }));
    setDateAndTime('2026-11-20', '03:00');

    await user.click(screen.getByText('Days'));
    await user.click(screen.getByRole('option', { name: 'Weeks' }));
    await user.click(screen.getByText('Select days'));
    await user.click(screen.getByRole('option', { name: 'Saturday' }));

    await user.click(screen.getByText('Never'));
    await user.click(screen.getByRole('option', { name: 'After' }));
    await user.clear(screen.getByLabelText('Occurrences'));
    await user.type(screen.getByLabelText('Occurrences'), '5');

    await user.click(screen.getByRole('button', { name: 'Schedule' }));

    expect(onRequest).toHaveBeenCalledWith({
      starts_at: '2026-11-20T03:00:00.000Z',
      timezone: 'Etc/UTC',
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        weekdays: [6],
        ends_on: null,
        max_occurrences: 5,
      },
    });
  });

  it('should change and cancel an existing schedule', async () => {
    const user = userEvent.setup();
    const onRequest = jest.fn();
    const onCancelSchedule = jest.fn();

    render(
      <OperationModal
        title="Reboot"
        isOpen
        schedulable
        timezone="Etc/UTC"
        initialSchedule={{
          starts_at: '2026-11-20T03:00:00Z',
          timezone: 'Etc/UTC',
          recurrence: {
            frequency: 'daily',
            interval: 2,
            ends_on: '2027-01-01',
          },
        }}
        onRequest={onRequest}
        onCancelSchedule={onCancelSchedule}
      />
    );

    expect(screen.queryByText('Now')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toHaveValue('2026-11-20');
    expect(screen.getByLabelText('Repeat every')).toHaveValue('2');
    expect(screen.getByLabelText('End date')).toHaveValue('2027-01-01');

    setDateAndTime('2026-11-21', '04:00');
    await user.click(screen.getByRole('button', { name: 'Save Schedule' }));

    expect(onRequest).toHaveBeenCalledWith({
      starts_at: '2026-11-21T04:00:00.000Z',
      timezone: 'Etc/UTC',
      recurrence: {
        frequency: 'daily',
        interval: 2,
        weekdays: [],
        ends_on: '2027-01-01',
        max_occurrences: null,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Cancel Schedule' }));
    expect(onCancelSchedule).toHaveBeenCalled();
  });

  it('should not offer scheduling when the operation is not schedulable', () => {
    render(<OperationModal title="Reboot" isOpen />);

    expect(screen.queryByLabelText('Schedule type')).not.toBeInTheDocument();
    expect(screen.queryByText('Premium')).not.toBeInTheDocument();
  });
});
