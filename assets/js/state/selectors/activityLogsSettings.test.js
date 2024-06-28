import {
  getActivityLogsSettings,
  getActivityLogsSettingsLoading,
  getActivityLogsSettingsSaved,
} from './activityLogsSettings';

describe('Activity Logs Settings selector', () => {
  describe('get activity logs settings', () => {
    const stateScenarios = [
      {
        loading: false,
        settings: {
          retention_time: { value: 2, unit: 'week' },
        },
        errors: null,
        editing: false,
      },
      {
        loading: true,
        settings: {
          retention_time: undefined,
        },
        errors: null,
        editing: false,
        testingConnection: false,
      },
    ];

    it.each(stateScenarios)(
      'should return the correct catalog state',
      (activityLogsSettings) => {
        expect(getActivityLogsSettings({ activityLogsSettings })).toEqual(
          activityLogsSettings
        );
      }
    );
  });

  describe('get activity logs settings loading', () => {
    const scenarios = [
      {
        state: { loading: false },
        result: false,
      },
      {
        state: { loading: true },
        result: true,
      },
    ];

    it.each(scenarios)(
      'should return if the activity logs settings are loading',
      ({ state, result }) => {
        expect(
          getActivityLogsSettingsLoading({ activityLogsSettings: state })
        ).toEqual(result);
      }
    );
  });

  describe('get if activity logs settings saved', () => {
    const scenarios = [
      {
        state: {
          loading: false,
          settings: {
            retention_time: { value: 2, unit: 'week' },
          },
          errors: null,
          editing: false,
        },
        result: true,
      },
      {
        state: {
          loading: false,
          settings: {
            retention_time: undefined,
          },
          errors: null,
          editing: false,
        },
        result: false,
      },
      {
        state: {
          loading: false,
          settings: {
            retention_time: {} /* invalid */,
          },
          errors: null,
          editing: false,
        },
        result: false,
      },
      {
        state: {
          loading: true,
          settings: {
            retention_time: undefined,
          },
          errors: null,
          editing: false,
        },
        result: false,
      },
    ];

    it.each(scenarios)(
      'should return if the activity logs settings are saved',
      ({ state, result }) => {
        expect(
          getActivityLogsSettingsSaved({ activityLogsSettings: state })
        ).toEqual(result);
      }
    );
  });
});
