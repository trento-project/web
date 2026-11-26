// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import TargetChecksFrequencyConfig from './TargetChecksFrequencyConfig';

const adminAbilities = [{ name: 'all', resource: 'all' }];

const systemSettings = {
  enabled: true,
  frequency: { value: 5, unit: 'minute' },
};

const globalSchedule = {
  enabled: true,
  frequency: { value: 5, unit: 'minute' },
  global: true,
  next_execution_at: null,
};

const ownSchedule = {
  enabled: true,
  frequency: { value: 6, unit: 'hour' },
  global: false,
  next_execution_at: null,
};

describe('TargetChecksFrequencyConfig', () => {
  it.each`
    targetType   | title                         | text
    ${'host'}    | ${'Host Check Executions'}    | ${'Configure when health checks are run for this host.'}
    ${'cluster'} | ${'Cluster Check Executions'} | ${'Configure when health checks are run for this cluster.'}
  `(
    'should render the check executions of a $targetType',
    ({ targetType, title, text }) => {
      render(
        <TargetChecksFrequencyConfig
          targetType={targetType}
          schedule={globalSchedule}
          systemSettings={systemSettings}
          userAbilities={adminAbilities}
        />
      );

      expect(screen.getByRole('heading', { name: title })).toBeVisible();
      expect(screen.getByText(text)).toBeVisible();
      expect(screen.getByText('Check Execution Frequency')).toBeVisible();
    }
  );

  it.each`
    enabled  | frequency                     | expected
    ${true}  | ${{ value: 6, unit: 'hour' }} | ${'Every 6 hours'}
    ${false} | ${{ value: 6, unit: 'hour' }} | ${'Disabled'}
    ${false} | ${null}                       | ${'Disabled'}
  `(
    'should render `$expected` with enabled `$enabled` and frequency `$frequency`',
    ({ enabled, frequency, expected }) => {
      render(
        <TargetChecksFrequencyConfig
          targetType="host"
          schedule={{ ...ownSchedule, enabled, frequency }}
          systemSettings={systemSettings}
          userAbilities={adminAbilities}
        />
      );

      expect(screen.getByLabelText('checks-frequency')).toHaveTextContent(
        expected
      );
    }
  );

  it('should mark the frequency of the system setting', () => {
    render(
      <TargetChecksFrequencyConfig
        targetType="host"
        schedule={globalSchedule}
        systemSettings={systemSettings}
        userAbilities={adminAbilities}
      />
    );

    expect(screen.getByLabelText('checks-frequency-source')).toHaveTextContent(
      'Uses the system setting'
    );
  });

  it.each`
    system                                                      | expected
    ${systemSettings}                                           | ${'Overrides the system setting (Every 5 mins)'}
    ${{ enabled: false, frequency: null }}                      | ${'Overrides the system setting (Disabled)'}
    ${{ enabled: true, frequency: { value: 1, unit: 'week' } }} | ${'Overrides the system setting (Every week)'}
  `(
    'should show the system setting next to an own frequency: $expected',
    ({ system, expected }) => {
      render(
        <TargetChecksFrequencyConfig
          targetType="cluster"
          schedule={ownSchedule}
          systemSettings={system}
          userAbilities={adminAbilities}
        />
      );

      expect(screen.getByLabelText('checks-frequency')).toHaveTextContent(
        'Every 6 hours'
      );
      expect(
        screen.getByLabelText('checks-frequency-source')
      ).toHaveTextContent(expected);
    }
  );

  it.each`
    targetType   | abilities
    ${'host'}    | ${adminAbilities}
    ${'host'}    | ${[{ name: 'all', resource: 'host_checks_frequency' }]}
    ${'cluster'} | ${adminAbilities}
    ${'cluster'} | ${[{ name: 'all', resource: 'cluster_checks_frequency' }]}
  `(
    'should fire onEditClick for a $targetType with the abilities $abilities',
    async ({ targetType, abilities }) => {
      const onEditClick = jest.fn();
      const user = userEvent.setup();

      render(
        <TargetChecksFrequencyConfig
          targetType={targetType}
          schedule={globalSchedule}
          systemSettings={systemSettings}
          userAbilities={abilities}
          onEditClick={onEditClick}
        />
      );

      const editButton = screen.getByRole('button', { name: 'Edit Settings' });
      expect(editButton).toBeEnabled();

      await user.click(editButton);
      expect(onEditClick).toHaveBeenCalledTimes(1);
    }
  );

  it.each`
    targetType   | abilities
    ${'host'}    | ${[]}
    ${'host'}    | ${[{ name: 'all', resource: 'cluster_checks_frequency' }]}
    ${'host'}    | ${[{ name: 'all', resource: 'checks_frequency_settings' }]}
    ${'cluster'} | ${[{ name: 'all', resource: 'host_checks_frequency' }]}
  `(
    'should forbid editing a $targetType with the abilities $abilities',
    async ({ targetType, abilities }) => {
      const onEditClick = jest.fn();
      const user = userEvent.setup();

      render(
        <TargetChecksFrequencyConfig
          targetType={targetType}
          schedule={globalSchedule}
          systemSettings={systemSettings}
          userAbilities={abilities}
          onEditClick={onEditClick}
        />
      );

      const editButton = screen.getByRole('button', { name: 'Edit Settings' });
      expect(editButton).toBeDisabled();

      await user.click(editButton);
      expect(onEditClick).not.toHaveBeenCalled();
    }
  );
});
