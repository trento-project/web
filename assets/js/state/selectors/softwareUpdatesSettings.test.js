import {
  getSoftwareUpdatesSettings,
  getSoftwareUpdatesSettingsLoading,
  getSoftwareUpdatesSettingsSaved,
} from './softwareUpdatesSettings';

describe('Software Updates Settings selector', () => {
  describe('get software updates settings', () => {
    const stateScenarios = [
      {
        loading: false,
        settings: {
          url: 'https://valid.url',
          username: 'username',
          ca_uploaded_at: '2021-01-01T00:00:00Z',
        },
        errors: null,
        editing: false,
      },
      {
        loading: true,
        settings: {
          url: undefined,
          username: undefined,
          ca_uploaded_at: undefined,
        },
        errors: null,
        editing: false,
        testingConnection: false,
      },
    ];

    it.each(stateScenarios)(
      'should return the correct catalog state',
      (softwareUpdatesSettings) => {
        expect(getSoftwareUpdatesSettings({ softwareUpdatesSettings })).toEqual(
          softwareUpdatesSettings
        );
      }
    );
  });

  describe('get software updates settings loading', () => {
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
      'should return if the software updates settings are loading',
      ({ state, result }) => {
        expect(
          getSoftwareUpdatesSettingsLoading({ softwareUpdatesSettings: state })
        ).toEqual(result);
      }
    );
  });

  describe('get if software updates settings saved', () => {
    const scenarios = [
      {
        state: {
          loading: false,
          settings: {
            url: 'https://valid.url',
            username: 'username',
            ca_uploaded_at: '2021-01-01T00:00:00Z',
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
            url: 'https://valid.url',
            username: undefined,
            ca_uploaded_at: '2021-01-01T00:00:00Z',
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
            url: undefined,
            username: undefined,
            ca_uploaded_at: undefined,
          },
          errors: null,
          editing: false,
        },
        result: false,
      },
    ];

    it.each(scenarios)(
      'should return if the software updates settings are saved',
      ({ state, result }) => {
        expect(
          getSoftwareUpdatesSettingsSaved({ softwareUpdatesSettings: state })
        ).toEqual(result);
      }
    );
  });
});
