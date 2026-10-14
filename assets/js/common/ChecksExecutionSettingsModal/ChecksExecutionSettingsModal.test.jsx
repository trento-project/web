// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ChecksExecutionSettingsModal from './ChecksExecutionSettingsModal';

describe('ChecksExecutionSettingsModal', () => {
  it('should save the selected frequency', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(
      <ChecksExecutionSettingsModal open initialInterval={5} onSave={onSave} />
    );

    expect(screen.getByText('Check Executions Settings')).toBeVisible();
    expect(
      screen.getByText('Configure when the health checks are run.')
    ).toBeVisible();

    await user.click(screen.getByText('5'));
    await user.click(screen.getByRole('option', { name: '15' }));
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(onSave).toHaveBeenCalledWith({ interval: 15 });
  });

  it('should close without saving', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    const onCancel = jest.fn();

    render(
      <ChecksExecutionSettingsModal
        open
        initialInterval={60}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onCancel).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
