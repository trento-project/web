import { getSoftwareUpdatesSettings } from './softwareUpdatesSettings';

describe('Software Updates Settings selector', () => {
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
