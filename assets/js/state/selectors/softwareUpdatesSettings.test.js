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
      error: null,
    },
    {
      loading: true,
      settings: {
        url: undefined,
        username: undefined,
        ca_uploaded_at: undefined,
      },
      error: null,
    },
  ];

  it.each(stateScenarios)(
    'should return the correct catalog state',
    (softwareUpdatesSettings) => {
      expect(getSoftwareUpdatesSettings()({ softwareUpdatesSettings })).toEqual(
        softwareUpdatesSettings
      );
    }
  );
});
