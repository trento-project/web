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
  it('should change the global checks execution interval', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <ChecksExecutionSettingsConfig
        settings={{ interval: 5, enforced_from_env: false }}
        userAbilities={adminAbilities}
        onChange={onChange}
      />
    );

    const select = screen.getByLabelText('Global checks execution frequency');
    expect(select).toHaveValue('5');

    await user.selectOptions(select, '360');
    expect(onChange).toHaveBeenCalledWith({ interval: 360 });
  });

  it('should not allow changes to an interval enforced from the environment', async () => {
    const user = userEvent.setup();

    render(
      <ChecksExecutionSettingsConfig
        settings={{ interval: 10, enforced_from_env: true }}
        userAbilities={adminAbilities}
      />
    );

    expect(screen.getByText('Every 10 minutes')).toBeVisible();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    await user.hover(screen.getByText('Every 10 minutes'));
    expect(screen.getByText(ENFORCED_FROM_ENV_MESSAGE)).toBeVisible();
  });

  it('should not allow changes without permission', () => {
    render(
      <ChecksExecutionSettingsConfig
        settings={{ interval: 5, enforced_from_env: false }}
        userAbilities={[]}
      />
    );

    expect(
      screen.getByLabelText('Global checks execution frequency')
    ).toBeDisabled();
  });
});
