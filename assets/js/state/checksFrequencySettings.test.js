// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import checksFrequencySettingsReducer, {
  startLoadingChecksFrequencySettings,
  setChecksFrequencySettings,
  setChecksFrequencySettingsErrors,
  setEditingChecksFrequencySettings,
  setChecksFrequencySettingsNetworkError,
} from './checksFrequencySettings';

describe('ChecksFrequencySettings reducer', () => {
  it('should start with loading settings', () => {
    expect(
      checksFrequencySettingsReducer(undefined, { type: '@@INIT' })
    ).toEqual({
      loading: true,
      settings: {
        enabled: undefined,
        frequency: undefined,
        enforced_from_env: false,
      },
      networkError: false,
      editing: false,
      errors: [],
    });
  });

  it('should mark checks frequency settings on loading state', () => {
    const initialState = {
      loading: false,
    };

    const action = startLoadingChecksFrequencySettings();

    expect(checksFrequencySettingsReducer(initialState, action)).toEqual({
      loading: true,
    });
  });

  it('should set checks frequency settings', () => {
    const initialState = {
      loading: true,
      settings: {
        enabled: undefined,
        frequency: undefined,
        enforced_from_env: false,
      },
      networkError: true,
      errors: [],
    };

    const settings = {
      enabled: true,
      frequency: { value: 6, unit: 'hour' },
      enforced_from_env: true,
    };

    const action = setChecksFrequencySettings(settings);

    expect(checksFrequencySettingsReducer(initialState, action)).toEqual({
      loading: false,
      settings,
      networkError: false,
      errors: [],
    });
  });

  it('should set errors upon validation failed', () => {
    const initialState = {
      loading: true,
      settings: {
        frequency: { value: 5, unit: 'minute' },
        enforced_from_env: false,
      },
      networkError: false,
      errors: [],
    };

    const errors = [
      {
        detail: 'must be one of 1, 6, 12, 24 when the unit is hour',
        source: { pointer: '/frequency/value' },
        title: 'Invalid value',
      },
    ];

    const action = setChecksFrequencySettingsErrors(errors);

    expect(checksFrequencySettingsReducer(initialState, action)).toEqual({
      ...initialState,
      loading: false,
      errors,
    });
  });

  it('should set the editing field', () => {
    const initialState = {
      loading: false,
      settings: {
        frequency: { value: 5, unit: 'minute' },
        enforced_from_env: false,
      },
      networkError: false,
      errors: [],
      editing: false,
    };

    const editing = checksFrequencySettingsReducer(
      initialState,
      setEditingChecksFrequencySettings(true)
    );
    expect(editing).toEqual({ ...initialState, editing: true });

    expect(
      checksFrequencySettingsReducer(
        editing,
        setEditingChecksFrequencySettings(false)
      )
    ).toEqual(initialState);
  });

  it.each([true, false])(
    'should mark loading false on received network error (%s)',
    (hasNetworkError) => {
      const initialState = {
        loading: true,
        settings: {
          frequency: { value: 5, unit: 'minute' },
          enforced_from_env: false,
        },
        networkError: !hasNetworkError,
        errors: [],
        editing: false,
      };

      const action = setChecksFrequencySettingsNetworkError(hasNetworkError);

      expect(checksFrequencySettingsReducer(initialState, action)).toEqual({
        ...initialState,
        loading: false,
        networkError: hasNetworkError,
      });
    }
  );
});
