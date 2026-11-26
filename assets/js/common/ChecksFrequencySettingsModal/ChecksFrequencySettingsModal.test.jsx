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

    expect(
      screen.getByRole('switch', { name: 'Run Checks Periodically' })
    ).toBeChecked();
    expect(screen.getByLabelText('checks-frequency-value')).toBeEnabled();
    expect(screen.getByLabelText('checks-frequency-unit')).toBeEnabled();
  });

  it('should render the kept frequency, not editable, when the periodic checks are disabled', async () => {
    await renderModal({
      initialEnabled: false,
      initialFrequency: { value: 6, unit: 'hour' },
    });

    expect(
      screen.getByRole('switch', { name: 'Run Checks Periodically' })
    ).not.toBeChecked();
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

      await user.click(
        screen.getByRole('switch', { name: 'Run Checks Periodically' })
      );

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

  it('should keep the value when the current unit is selected again', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    await renderModal({
      initialFrequency: { value: 30, unit: 'minute' },
      onSave,
    });

    await selectUnit(user, 'Minutes');
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(onSave).toHaveBeenCalledWith({
      enabled: true,
      frequency: { value: 30, unit: 'minute' },
    });
  });

  it('should not allow changing the settings while saving', async () => {
    await renderModal({
      initialFrequency: { value: 6, unit: 'hour' },
      loading: true,
    });

    expect(
      screen.getByRole('switch', { name: 'Run Checks Periodically' })
    ).toBeDisabled();
    expect(screen.getByLabelText('checks-frequency-value')).toBeDisabled();
    expect(screen.getByLabelText('checks-frequency-unit')).toBeDisabled();
  });

  it('should announce the errors', async () => {
    await renderModal({
      initialFrequency: { value: 6, unit: 'hour' },
      errors: [
        {
          detail: 'must be one of 1, 6, 12, 24 when the unit is hour',
          source: { pointer: '/frequency/value' },
          title: 'Invalid value',
        },
      ],
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Must be one of 1, 6, 12, 24 when the unit is hour'
    );
  });

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

  describe('with the system setting of a target', () => {
    const systemSettings = {
      enabled: true,
      frequency: { value: 5, unit: 'minute' },
    };

    it('should not offer the system setting without system settings', async () => {
      await renderModal({ initialFrequency: { value: 6, unit: 'hour' } });

      expect(
        screen.queryByRole('switch', { name: 'Use system setting' })
      ).not.toBeInTheDocument();
    });

    it('should show the system setting read only', async () => {
      await renderModal({
        systemSettings: {
          enabled: true,
          frequency: { value: 1, unit: 'hour' },
        },
        initialUseSystemSetting: true,
        initialEnabled: true,
        initialFrequency: { value: 1, unit: 'hour' },
      });

      expect(
        screen.getByRole('switch', { name: 'Use system setting' })
      ).toBeChecked();
      expect(
        screen.getByRole('switch', { name: 'Run Checks Periodically' })
      ).toBeDisabled();
      expect(screen.getByText('1')).toBeVisible();
      expect(screen.getByText('Hours')).toBeVisible();
      expect(screen.getByLabelText('checks-frequency-value')).toBeDisabled();
      expect(screen.getByLabelText('checks-frequency-unit')).toBeDisabled();
    });

    it('should save the system setting', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();

      await renderModal({
        systemSettings,
        initialUseSystemSetting: true,
        initialEnabled: true,
        initialFrequency: { value: 5, unit: 'minute' },
        onSave,
      });

      await user.click(screen.getByRole('button', { name: 'Save Settings' }));

      expect(onSave).toHaveBeenCalledWith(null);
    });

    it('should save the own settings of a target', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();

      await renderModal({
        systemSettings,
        initialUseSystemSetting: true,
        initialEnabled: true,
        initialFrequency: { value: 5, unit: 'minute' },
        onSave,
      });

      await user.click(
        screen.getByRole('switch', { name: 'Use system setting' })
      );

      expect(screen.getByLabelText('checks-frequency-value')).toBeEnabled();

      await selectUnit(user, 'Hours');
      await selectValue(user, '6');
      await user.click(screen.getByRole('button', { name: 'Save Settings' }));

      expect(onSave).toHaveBeenCalledWith({
        enabled: true,
        frequency: { value: 6, unit: 'hour' },
      });
    });

    it('should edit the own settings of a target that has them', async () => {
      await renderModal({
        systemSettings,
        initialUseSystemSetting: false,
        initialEnabled: false,
        initialFrequency: { value: 2, unit: 'week' },
      });

      expect(
        screen.getByRole('switch', { name: 'Use system setting' })
      ).not.toBeChecked();
      expect(
        screen.getByRole('switch', { name: 'Run Checks Periodically' })
      ).toBeEnabled();
      expect(screen.getByText('2')).toBeVisible();
      expect(screen.getByText('Weeks')).toBeVisible();
    });

    it('should go back to the system setting from own settings', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();

      await renderModal({
        systemSettings: {
          enabled: true,
          frequency: { value: 1, unit: 'hour' },
        },
        initialUseSystemSetting: false,
        initialEnabled: false,
        initialFrequency: { value: 2, unit: 'week' },
        onSave,
      });

      await user.click(
        screen.getByRole('switch', { name: 'Use system setting' })
      );

      expect(
        screen.getByRole('switch', { name: 'Run Checks Periodically' })
      ).toBeChecked();
      expect(screen.getByText('1')).toBeVisible();
      expect(screen.getByText('Hours')).toBeVisible();
      expect(screen.getByLabelText('checks-frequency-value')).toBeDisabled();

      await user.click(screen.getByRole('button', { name: 'Save Settings' }));

      expect(onSave).toHaveBeenCalledWith(null);
    });

    it('should show no frequency for a system setting without one', async () => {
      await renderModal({
        systemSettings: { enabled: false, frequency: null },
        initialUseSystemSetting: true,
        initialEnabled: false,
        initialFrequency: null,
      });

      expect(
        screen.getByRole('switch', { name: 'Run Checks Periodically' })
      ).not.toBeChecked();
      expect(screen.queryByText('5')).not.toBeInTheDocument();
      expect(screen.queryByText('Minutes')).not.toBeInTheDocument();
    });

    it('should follow the system setting given after the modal opened', async () => {
      const props = {
        open: true,
        initialUseSystemSetting: true,
        initialEnabled: true,
        initialFrequency: { value: 6, unit: 'hour' },
      };
      let view;
      await act(() => {
        view = render(<ChecksFrequencySettingsModal {...props} />);
      });

      await act(() =>
        view.rerender(
          <ChecksFrequencySettingsModal
            {...props}
            systemSettings={systemSettings}
          />
        )
      );

      expect(
        screen.getByRole('switch', { name: 'Use system setting' })
      ).toBeChecked();
      expect(screen.getByText('5')).toBeVisible();
      expect(screen.getByText('Minutes')).toBeVisible();
    });

    it('should edit the own settings when the system setting goes away', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();
      const props = {
        open: true,
        initialUseSystemSetting: true,
        initialEnabled: true,
        initialFrequency: { value: 6, unit: 'hour' },
        onSave,
      };
      let view;
      await act(() => {
        view = render(
          <ChecksFrequencySettingsModal
            {...props}
            systemSettings={systemSettings}
          />
        );
      });

      await act(() =>
        view.rerender(<ChecksFrequencySettingsModal {...props} />)
      );

      expect(
        screen.queryByRole('switch', { name: 'Use system setting' })
      ).not.toBeInTheDocument();
      expect(screen.getByText('6')).toBeVisible();
      expect(screen.getByText('Hours')).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'Save Settings' }));

      expect(onSave).toHaveBeenCalledWith({
        enabled: true,
        frequency: { value: 6, unit: 'hour' },
      });
    });

    it('should not allow changing the system setting while saving', async () => {
      await renderModal({
        systemSettings,
        initialUseSystemSetting: true,
        initialFrequency: { value: 5, unit: 'minute' },
        loading: true,
      });

      expect(
        screen.getByRole('switch', { name: 'Use system setting' })
      ).toBeDisabled();
    });

    it('should clear the errors when switching the system setting', async () => {
      const user = userEvent.setup();
      const onClearErrors = jest.fn();

      await renderModal({
        systemSettings,
        initialUseSystemSetting: true,
        initialFrequency: { value: 5, unit: 'minute' },
        onClearErrors,
      });

      await user.click(
        screen.getByRole('switch', { name: 'Use system setting' })
      );

      expect(onClearErrors).toHaveBeenCalledTimes(1);
    });

    it('should keep the own settings while the system setting is switched on and off', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();

      await renderModal({
        systemSettings: {
          enabled: true,
          frequency: { value: 1, unit: 'hour' },
        },
        initialUseSystemSetting: false,
        initialEnabled: true,
        initialFrequency: { value: 2, unit: 'week' },
        onSave,
      });

      const systemSettingSwitch = screen.getByRole('switch', {
        name: 'Use system setting',
      });
      await user.click(systemSettingSwitch);
      expect(screen.getByText('Hours')).toBeVisible();

      await user.click(systemSettingSwitch);
      expect(screen.getByText('2')).toBeVisible();
      expect(screen.getByText('Weeks')).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'Save Settings' }));

      expect(onSave).toHaveBeenCalledWith({
        enabled: true,
        frequency: { value: 2, unit: 'week' },
      });
    });

    it('should start from 5 minutes without a global frequency', async () => {
      const user = userEvent.setup();

      await renderModal({
        systemSettings: { enabled: false, frequency: null },
        initialUseSystemSetting: true,
        initialEnabled: false,
        initialFrequency: null,
      });

      await user.click(
        screen.getByRole('switch', { name: 'Use system setting' })
      );

      expect(screen.getByText('5')).toBeVisible();
      expect(screen.getByText('Minutes')).toBeVisible();
    });
  });
});
