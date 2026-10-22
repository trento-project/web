// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ChecksExecutionSettingsConfig, {
  ENFORCED_FROM_ENV_MESSAGE,
} from './ChecksExecutionSettingsConfig';

const adminAbilities = [{ name: 'all', resource: 'all' }];

describe('ChecksExecutionSettingsConfig', () => {
  it('should show the global checks execution frequency', async () => {
    const user = userEvent.setup();
    const onEditClick = jest.fn();

    render(
      <ChecksExecutionSettingsConfig
        settings={{ interval: 15, enforced_from_env: false }}
        userAbilities={adminAbilities}
        onEditClick={onEditClick}
      />
    );

    expect(screen.getByText('Check Executions')).toBeVisible();
    expect(screen.getByText('Check Execution Frequency')).toBeVisible();
    expect(screen.getByText('Every 15 minutes')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Edit Settings' }));
    expect(onEditClick).toHaveBeenCalled();
  });

  it('should not allow editing a frequency enforced from the environment', async () => {
    const user = userEvent.setup();

    render(
      <ChecksExecutionSettingsConfig
        settings={{ interval: 10, enforced_from_env: true }}
        userAbilities={adminAbilities}
      />
    );

    expect(screen.getByText('Every 10 minutes')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Edit Settings' })
    ).toBeDisabled();

    await user.hover(screen.getByRole('button', { name: 'Edit Settings' }));
    expect(screen.getByText(ENFORCED_FROM_ENV_MESSAGE)).toBeVisible();
  });

  it('should not allow editing without permission', () => {
    render(
      <ChecksExecutionSettingsConfig
        settings={{ interval: 5, enforced_from_env: false }}
        userAbilities={[]}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Edit Settings' })
    ).toBeDisabled();
  });
});
