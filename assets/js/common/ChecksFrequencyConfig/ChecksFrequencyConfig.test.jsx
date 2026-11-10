// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ChecksFrequencyConfig from './ChecksFrequencyConfig';

const adminAbilities = [{ name: 'all', resource: 'all' }];

describe('ChecksFrequencyConfig', () => {
  it('should render the check executions section', () => {
    render(
      <ChecksFrequencyConfig
        frequency={{ value: 5, unit: 'minute' }}
        userAbilities={adminAbilities}
      />
    );

    expect(screen.getByText('Check Executions')).toBeVisible();
    expect(
      screen.getByText('Configure when the health checks are run.')
    ).toBeVisible();
    expect(screen.getByText('Check Execution Frequency')).toBeVisible();
    expect(screen.getByLabelText('checks-frequency')).toHaveTextContent(
      'Every 5 mins'
    );
  });

  it.each`
    enabled  | frequency                      | expected
    ${true}  | ${{ value: 6, unit: 'hour' }}  | ${'Every 6 hours'}
    ${false} | ${{ value: 6, unit: 'hour' }}  | ${'Disabled'}
    ${true}  | ${undefined}                   | ${'invalid value'}
    ${true}  | ${/* invalid */ { foo: true }} | ${'invalid value'}
  `(
    'should render `$expected` with enabled `$enabled` and frequency `$frequency`',
    ({ enabled, frequency, expected }) => {
      render(
        <ChecksFrequencyConfig
          enabled={enabled}
          frequency={frequency}
          userAbilities={adminAbilities}
        />
      );

      expect(screen.getByLabelText('checks-frequency')).toHaveTextContent(
        expected
      );
    }
  );

  it.each`
    case                               | abilities
    ${'admin'}                         | ${adminAbilities}
    ${'all:checks_frequency_settings'} | ${[{ name: 'all', resource: 'checks_frequency_settings' }]}
  `(
    'should fire onEditClick when clicking on the edit button ($case)',
    async ({ abilities }) => {
      const onEditClick = jest.fn();
      const user = userEvent.setup();

      render(
        <ChecksFrequencyConfig
          frequency={{ value: 5, unit: 'minute' }}
          onEditClick={onEditClick}
          userAbilities={abilities}
        />
      );

      const editButton = screen.getByLabelText('checks-frequency-edit-button');
      expect(editButton).toBeEnabled();

      await user.click(editButton);
      expect(onEditClick).toHaveBeenCalledTimes(1);
    }
  );

  it.each`
    case                        | abilities
    ${'not set'}                | ${undefined}
    ${'empty list'}             | ${[]}
    ${'non-relevant abilities'} | ${[{ name: 'all', resource: 'alerting_settings' }]}
  `(
    'should forbid editing when the user has not the right abilities ($case)',
    async ({ abilities }) => {
      const onEditClick = jest.fn();
      const user = userEvent.setup();

      render(
        <ChecksFrequencyConfig
          frequency={{ value: 5, unit: 'minute' }}
          onEditClick={onEditClick}
          userAbilities={abilities}
        />
      );

      const editButton = screen.getByLabelText('checks-frequency-edit-button');
      expect(editButton).toBeDisabled();

      await user.click(editButton);
      expect(onEditClick).not.toHaveBeenCalled();

      await user.hover(editButton);
      expect(
        screen.getByText('You are not authorized for this action')
      ).toBeVisible();
    }
  );

  it('should forbid editing when the frequency is enforced from env', async () => {
    const onEditClick = jest.fn();
    const user = userEvent.setup();

    render(
      <ChecksFrequencyConfig
        frequency={{ value: 6, unit: 'hour' }}
        enforcedFromEnv
        onEditClick={onEditClick}
        userAbilities={adminAbilities}
      />
    );

    const editButton = screen.getByLabelText('checks-frequency-edit-button');
    expect(editButton).toBeDisabled();

    await user.click(editButton);
    expect(onEditClick).not.toHaveBeenCalled();

    await user.hover(editButton);
    expect(
      screen.getByText(
        'Check executions settings are enforced by the CHECKS_INTERVAL environment variable'
      )
    ).toBeVisible();
  });
});
