import { getActivityLogsSettings } from './activityLogsSettings';

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
});
