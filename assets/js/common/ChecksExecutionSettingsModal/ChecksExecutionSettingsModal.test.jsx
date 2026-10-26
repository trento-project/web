// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ChecksExecutionSettingsModal from './ChecksExecutionSettingsModal';

describe('ChecksExecutionSettingsModal', () => {
  it('should save the new frequency', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(
      <ChecksExecutionSettingsModal open initialInterval="5m" onSave={onSave} />
    );

    await user.click(screen.getByText('Minutes'));
    await user.click(screen.getByRole('option', { name: 'Hours' }));
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(onSave).toHaveBeenCalledWith({ interval: '1h' });
  });
});
