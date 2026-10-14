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
    expect(
      screen.getByText('Request the operation now or at a later date and time.')
    ).toBeVisible();

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
    setDateAndTime('2026-10-20', '03:00');
    await user.click(screen.getByRole('button', { name: 'Schedule' }));

    expect(onRequest).toHaveBeenCalledWith({
      starts_at: '2026-10-20T01:00:00.000Z',
      timezone: 'Europe/Berlin',
      frequency: null,
      interval: 1,
      weekdays: [],
      ends_on: null,
      max_occurrences: null,
    });
  });

  it('should schedule a periodic operation', async () => {
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
    setDateAndTime('2026-10-20', '03:00');

    await user.clear(screen.getByLabelText('Repeat every'));
    await user.type(screen.getByLabelText('Repeat every'), '2');
    await user.click(screen.getByText('Days'));
    await user.click(screen.getByRole('option', { name: 'Weeks' }));

    await user.click(screen.getByText('Select days'));
    await user.click(screen.getByRole('option', { name: 'Saturday' }));
    // jsdom closes the menu after a selection, reopen it from the selected day
    await user.click(screen.getByText('Saturday'));
    await user.click(screen.getByRole('option', { name: 'Sunday' }));

    await user.click(screen.getByText('Never'));
    await user.click(screen.getByRole('option', { name: 'After' }));
    await user.clear(screen.getByLabelText('Occurrences'));
    await user.type(screen.getByLabelText('Occurrences'), '5');

    await user.click(screen.getByRole('button', { name: 'Schedule' }));

    expect(onRequest).toHaveBeenCalledWith({
      starts_at: '2026-10-20T03:00:00.000Z',
      timezone: 'Etc/UTC',
      frequency: 'weekly',
      interval: 2,
      weekdays: [6, 7],
      ends_on: null,
      max_occurrences: 5,
    });
  });

  it('should end a periodic operation on a date', async () => {
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
    setDateAndTime('2026-10-20', '03:00');
    await user.click(screen.getByText('Never'));
    await user.click(screen.getByRole('option', { name: 'On date' }));
    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2027-01-01' },
    });
    await user.click(screen.getByRole('button', { name: 'Schedule' }));

    expect(onRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: 'daily',
        ends_on: '2027-01-01',
        max_occurrences: null,
      })
    );
  });

  it('should not offer scheduling when the operation is not schedulable', () => {
    render(<OperationModal title="Reboot" isOpen />);

    expect(screen.queryByLabelText('Schedule type')).not.toBeInTheDocument();
  });
});
