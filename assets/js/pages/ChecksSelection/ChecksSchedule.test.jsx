// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ChecksSchedule from './ChecksSchedule';

const schedule = {
  interval: null,
  effective_interval: 5,
  exception_windows: [
    {
      id: 'b4a5f1b0-0d5e-4e4e-9a59-1f2c3d4e5f60',
      starts_at: '2026-10-20T20:00:00Z',
      duration: 120,
    },
  ],
};

describe('ChecksSchedule', () => {
  it('should show the interval applied to the target', () => {
    render(<ChecksSchedule schedule={schedule} canEdit />);

    expect(screen.getByText('Checks run every 5 minutes')).toBeVisible();
    expect(screen.getByLabelText('Checks execution frequency')).toHaveValue('');
  });

  it('should set and reset the interval of the target', async () => {
    const user = userEvent.setup();
    const onChangeInterval = jest.fn();

    render(
      <ChecksSchedule
        schedule={{ ...schedule, interval: 60, effective_interval: 60 }}
        canEdit
        onChangeInterval={onChangeInterval}
      />
    );

    const select = screen.getByLabelText('Checks execution frequency');
    await user.selectOptions(select, '1440');
    await user.selectOptions(select, '');

    expect(onChangeInterval).toHaveBeenNthCalledWith(1, 1440);
    expect(onChangeInterval).toHaveBeenNthCalledWith(2, null);
  });

  it('should list the exception windows in the user timezone and delete them', async () => {
    const user = userEvent.setup();
    const onDeleteWindow = jest.fn();

    render(
      <ChecksSchedule
        schedule={schedule}
        timezone="Europe/Berlin"
        canEdit
        onDeleteWindow={onDeleteWindow}
      />
    );

    expect(screen.getByText('20 Oct 2026, 22:00:00')).toBeVisible();
    expect(screen.getByText('120 minutes')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Delete window' }));
    expect(onDeleteWindow).toHaveBeenCalledWith(
      'b4a5f1b0-0d5e-4e4e-9a59-1f2c3d4e5f60'
    );
  });

  it('should add an exception window starting at a time of the user timezone', async () => {
    const user = userEvent.setup();
    const onAddWindow = jest.fn();

    render(
      <ChecksSchedule
        schedule={{ ...schedule, exception_windows: [] }}
        timezone="Europe/Berlin"
        canEdit
        onAddWindow={onAddWindow}
      />
    );

    await user.type(screen.getByLabelText('Window start'), '2026-10-20T22:00');
    await user.clear(screen.getByLabelText('Window duration in minutes'));
    await user.type(screen.getByLabelText('Window duration in minutes'), '90');
    await user.click(screen.getByRole('button', { name: 'Add window' }));

    expect(onAddWindow).toHaveBeenCalledWith({
      starts_at: '2026-10-20T20:00:00.000Z',
      duration: 90,
    });
  });

  it('should not allow changes without permission', () => {
    render(<ChecksSchedule schedule={schedule} canEdit={false} />);

    expect(screen.getByLabelText('Checks execution frequency')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add window' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Delete window' })
    ).toBeDisabled();
  });
});
