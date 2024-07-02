import activityLogsSettingsReducer, {
  startLoadingActivityLogsSettings,
  setActivityLogsSettings,
  setActivityLogsSettingsErrors,
  setEditingActivityLogsSettings,
  setNetworkError,
} from './activityLogsSettings';

describe('ActivityLogsSettings reducer', () => {
  it('should mark software updates settings on loading state', () => {
    const initialState = {
      loading: false,
    };

    const action = startLoadingActivityLogsSettings();

    const expectedState = {
      loading: true,
    };

    expect(activityLogsSettingsReducer(initialState, action)).toEqual(
      expectedState
    );
  });

  it('should set software updates settings', () => {
    const initialState = {
      loading: true,
      settings: {
        retention_time: undefined,
      },
      networkError: false,
      errors: [],
    };

    const settings = {
      retention_time: { value: 2, unit: 'week' },
    };

    const action = setActivityLogsSettings(settings);

    const actual = activityLogsSettingsReducer(initialState, action);

    expect(actual).toEqual({
      loading: false,
      settings,
      networkError: false,
      errors: [],
    });
  });

  it('should set errors upon validation failed', () => {
    const initialState = {
      loading: false,
      settings: {
        retention_time: { value: 2, unit: 'week' },
      },
      networkError: false,
      errors: [],
    };

    const errors = [
      {
        detail: "can't be blank",
        source: { pointer: '/retention_time' },
        title: 'Invalid value',
      },
    ];

    const action = setActivityLogsSettingsErrors(errors);

    const actual = activityLogsSettingsReducer(initialState, action);

    expect(actual).toEqual({
      loading: false,
      settings: {
        retention_time: { value: 2, unit: 'week' },
      },
      networkError: false,
      errors,
    });
  });

  it('should set the editing field to true', () => {
    const initialState = {
      loading: false,
      settings: {
        retention_time: { value: 2, unit: 'week' },
      },
      networkError: false,
      errors: [],
      editing: false,
    };

    const action = setEditingActivityLogsSettings(true);

    const actual = activityLogsSettingsReducer(initialState, action);

    expect(actual).toEqual({
      ...initialState,
      editing: true,
    });
  });

  it('should mark that the connection is being tested', () => {
    const initialState = {
      loading: true,
      settings: {
        retention_time: { value: 2, unit: 'week' },
      },
      networkError: false,
      errors: [],
      editing: false,
      testingConnection: false,
    };

    [true, false].forEach((hasNetworkError) => {
      const action = setNetworkError(hasNetworkError);

      const actual = activityLogsSettingsReducer(initialState, action);

      expect(actual).toEqual({
        ...initialState,
        loading: false,
        networkError: hasNetworkError,
      });
    });
  });
});
