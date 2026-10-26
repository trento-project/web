// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ChecksExecutionSettingsConfig, {
  ENFORCED_FROM_ENV_MESSAGE,
} from './ChecksExecutionSettingsConfig';

const abilities = [{ name: 'all', resource: 'all' }];

describe('ChecksExecutionSettingsConfig', () => {
  it('should show the checks execution frequency and open the edition', async () => {
    const user = userEvent.setup();
    const onEditClick = jest.fn();

    render(
      <ChecksExecutionSettingsConfig
        settings={{ interval: '15m', enforced_from_env: false }}
        userAbilities={abilities}
        onEditClick={onEditClick}
      />
    );

    expect(screen.getByText('Check Executions')).toBeVisible();
    expect(screen.getByText('Every 15 minutes')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Edit Settings' }));
    expect(onEditClick).toHaveBeenCalled();
  });

  it('should show disabled periodic executions', () => {
    render(
      <ChecksExecutionSettingsConfig
        settings={{ interval: 'disabled', enforced_from_env: false }}
        userAbilities={abilities}
      />
    );

    expect(screen.getByText('Disabled')).toBeVisible();
  });

  it('should not allow changes when the frequency is enforced by the environment', async () => {
    const user = userEvent.setup();

    render(
      <ChecksExecutionSettingsConfig
        settings={{ interval: '1h', enforced_from_env: true }}
        userAbilities={abilities}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Edit Settings' })
    ).toBeDisabled();
    await user.hover(screen.getByRole('button', { name: 'Edit Settings' }));
    expect(await screen.findByText(ENFORCED_FROM_ENV_MESSAGE)).toBeVisible();
  });
});
