// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { defaultGlobalError } from '@lib/api/validationErrors';
import ChecksFrequencySettingsModal from '.';

const renderModal = (props) =>
  act(() =>
    render(
      <ChecksFrequencySettingsModal
        open
        onSave={() => {}}
        onCancel={() => {}}
        {...props}
      />
    )
  );

const optionLabels = () =>
  screen.getAllByRole('option').map((option) => option.textContent);

const selectUnit = async (user, unit) => {
  await user.click(screen.getByLabelText('checks-frequency-unit'));
  await user.click(screen.getByRole('option', { name: unit }));
};

const selectValue = async (user, value) => {
  await user.click(screen.getByLabelText('checks-frequency-value'));
  await user.click(screen.getByRole('option', { name: value }));
};

describe('ChecksFrequencySettingsModal component', () => {
  it.each`
    initialFrequency                 | expectedValue | expectedUnit
    ${{ value: 15, unit: 'minute' }} | ${'15'}       | ${'Minutes'}
    ${{ value: 6, unit: 'hour' }}    | ${'6'}        | ${'Hours'}
    ${{ value: 2, unit: 'week' }}    | ${'2'}        | ${'Weeks'}
  `(
    'should render the initial frequency $initialFrequency',
    async ({ initialFrequency, expectedValue, expectedUnit }) => {
      await renderModal({ initialFrequency });

      expect(screen.getByText(expectedValue)).toBeVisible();
      expect(screen.getByText(expectedUnit)).toBeVisible();
    }
  );

  it('should render the periodic checks enabled, with an editable frequency', async () => {
    await renderModal({ initialFrequency: { value: 6, unit: 'hour' } });

    expect(screen.getByLabelText('checks-frequency-enabled')).toBeChecked();
    expect(screen.getByLabelText('checks-frequency-value')).toBeEnabled();
    expect(screen.getByLabelText('checks-frequency-unit')).toBeEnabled();
  });

  it('should render the kept frequency, not editable, when the periodic checks are disabled', async () => {
    await renderModal({
      initialEnabled: false,
      initialFrequency: { value: 6, unit: 'hour' },
    });

    expect(screen.getByLabelText('checks-frequency-enabled')).not.toBeChecked();
    expect(screen.getByText('6')).toBeVisible();
    expect(screen.getByText('Hours')).toBeVisible();
    expect(screen.getByLabelText('checks-frequency-value')).toBeDisabled();
    expect(screen.getByLabelText('checks-frequency-unit')).toBeDisabled();
  });

  it('should offer the units', async () => {
    const user = userEvent.setup();
    await renderModal({ initialFrequency: { value: 5, unit: 'minute' } });

    await user.click(screen.getByLabelText('checks-frequency-unit'));

    expect(optionLabels()).toEqual(['Minutes', 'Hours', 'Weeks']);
  });

  it.each`
    initialFrequency                | expectedValues
    ${{ value: 5, unit: 'minute' }} | ${['5', '15', '30']}
    ${{ value: 1, unit: 'hour' }}   | ${['1', '6', '12', '24']}
    ${{ value: 4, unit: 'week' }}   | ${['1', '2', '4']}
  `(
    'should offer only the allowed values for the unit of $initialFrequency',
    async ({ initialFrequency, expectedValues }) => {
      const user = userEvent.setup();
      await renderModal({ initialFrequency });

      await user.click(screen.getByLabelText('checks-frequency-value'));

      expect(optionLabels()).toEqual(expectedValues);
    }
  );

  it.each`
    initialEnabled | initialFrequency
    ${true}        | ${{ value: 12, unit: 'hour' }}
    ${false}       | ${{ value: 2, unit: 'week' }}
  `(
    'should save the unchanged settings (enabled: $initialEnabled)',
    async ({ initialEnabled, initialFrequency }) => {
      const user = userEvent.setup();
      const onSave = jest.fn();

      await renderModal({ initialEnabled, initialFrequency, onSave });

      await user.click(screen.getByRole('button', { name: 'Save Settings' }));

      expect(onSave).toHaveBeenCalledWith({
        enabled: initialEnabled,
        frequency: initialFrequency,
      });
    }
  );

  it.each`
    initialEnabled | initialFrequency                 | expectedEnabled
    ${true}        | ${{ value: 6, unit: 'hour' }}    | ${false}
    ${false}       | ${{ value: 15, unit: 'minute' }} | ${true}
  `(
    'should switch the periodic checks to $expectedEnabled, keeping the frequency',
    async ({ initialEnabled, initialFrequency, expectedEnabled }) => {
      const user = userEvent.setup();
      const onSave = jest.fn();
      const onClearErrors = jest.fn();

      await renderModal({
        initialEnabled,
        initialFrequency,
        onSave,
        onClearErrors,
      });

      await user.click(screen.getByLabelText('checks-frequency-enabled'));

      expect(onClearErrors).toHaveBeenCalled();
      expect(screen.getByLabelText('checks-frequency-value')).toHaveProperty(
        'disabled',
        !expectedEnabled
      );

      await user.click(screen.getByRole('button', { name: 'Save Settings' }));

      expect(onSave).toHaveBeenCalledWith({
        enabled: expectedEnabled,
        frequency: initialFrequency,
      });
    }
  );

  it.each`
    initialFrequency                 | unit         | value   | expectedFrequency
    ${{ value: 5, unit: 'minute' }}  | ${undefined} | ${'30'} | ${{ value: 30, unit: 'minute' }}
    ${{ value: 15, unit: 'minute' }} | ${'Weeks'}   | ${'2'}  | ${{ value: 2, unit: 'week' }}
    ${{ value: 6, unit: 'hour' }}    | ${'Minutes'} | ${null} | ${{ value: 5, unit: 'minute' }}
    ${{ value: 2, unit: 'week' }}    | ${'Hours'}   | ${'24'} | ${{ value: 24, unit: 'hour' }}
  `(
    'should save the frequency $expectedFrequency changed from $initialFrequency',
    async ({ initialFrequency, unit, value, expectedFrequency }) => {
      const user = userEvent.setup();
      const onSave = jest.fn();
      const onClearErrors = jest.fn();

      await renderModal({ initialFrequency, onSave, onClearErrors });

      if (unit) {
        await selectUnit(user, unit);
      }
      if (value) {
        await selectValue(user, value);
      }

      expect(onClearErrors).toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Save Settings' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({
        enabled: true,
        frequency: expectedFrequency,
      });
    }
  );

  it('should not save while saving is in progress', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    await renderModal({
      initialFrequency: { value: 5, unit: 'minute' },
      loading: true,
      onSave,
    });

    expect(
      screen.getByRole('button', { name: 'Save Settings' })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should close', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    await renderModal({
      initialFrequency: { value: 5, unit: 'minute' },
      onCancel,
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  const valueError = {
    detail: 'must be one of 1, 6, 12, 24 when the unit is hour',
    source: { pointer: '/frequency/value' },
    title: 'Invalid value',
  };
  const unitError = {
    detail: 'is invalid',
    source: { pointer: '/frequency/unit' },
    title: 'Invalid value',
  };
  const missingFrequencyError = {
    detail: 'Missing field: frequency',
    source: { pointer: '/frequency' },
    title: 'Invalid value',
  };
  const conflictError = {
    detail: 'Checks frequency settings can not be set, enforced by ENV.',
    title: 'Conflict has occurred',
  };

  it.each`
    scenario                               | errors                             | expectedErrorMessage
    ${'value error'}                       | ${[valueError]}                    | ${'Must be one of 1, 6, 12, 24 when the unit is hour'}
    ${'unit error'}                        | ${[unitError]}                     | ${'Is invalid'}
    ${'missing frequency error'}           | ${[missingFrequencyError]}         | ${'Missing field: frequency'}
    ${'value and unit errors (1)'}         | ${[valueError, unitError]}         | ${'Must be one of 1, 6, 12, 24 when the unit is hour'}
    ${'value and unit errors (2)'}         | ${[valueError, unitError]}         | ${'Is invalid'}
    ${'generic error'}                     | ${['a generic error']}             | ${defaultGlobalError.detail}
    ${'generic error and value error (1)'} | ${['a generic error', valueError]} | ${defaultGlobalError.detail}
    ${'generic error and value error (2)'} | ${['a generic error', valueError]} | ${'Must be one of 1, 6, 12, 24 when the unit is hour'}
  `(
    'should display errors on $scenario',
    async ({ errors, expectedErrorMessage }) => {
      await renderModal({
        initialFrequency: { value: 6, unit: 'hour' },
        errors,
      });

      expect(
        screen.getAllByText(expectedErrorMessage, { exact: false })
      ).toHaveLength(1);
    }
  );

  it('should display the enforced from env conflict as it is', async () => {
    await renderModal({
      initialFrequency: { value: 6, unit: 'hour' },
      errors: [conflictError],
    });

    expect(
      screen.getByText(
        'Checks frequency settings can not be set, enforced by ENV.'
      )
    ).toBeVisible();
  });
});
