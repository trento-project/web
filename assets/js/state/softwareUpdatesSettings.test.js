import softwareUpdatesSettingsReducer, {
  startLoadingSoftwareUpdatesSettings,
  setSoftwareUpdatesSettings,
  setEmptySoftwareUpdatesSettings,
} from './softwareUpdatesSettings';

describe('SoftwareUpdateSettings reducer', () => {
  it('should mark software updates settings on loading state', () => {
    const initialState = {
      loading: false,
    };

    const action = startLoadingSoftwareUpdatesSettings();

    const expectedState = {
      loading: true,
    };

    expect(softwareUpdatesSettingsReducer(initialState, action)).toEqual(
      expectedState
    );
  });

  it('should set software updates settings', () => {
    const initialState = {
      loading: true,
      settings: {
        url: undefined,
        username: undefined,
        ca_uploaded_at: undefined,
      },
      networkError: null,
    };

    const settings = {
      url: 'https://valid.url',
      username: 'username',
      ca_uploaded_at: '2021-01-01T00:00:00Z',
    };

    const action = setSoftwareUpdatesSettings({ settings });

    const actual = softwareUpdatesSettingsReducer(initialState, action);

    expect(actual).toEqual({
      loading: false,
      settings,
      networkError: null,
    });
  });

  it('should empty software updates settings', () => {
    const initialState = {
      loading: true,
      settings: {
        url: 'https://valid.url',
        username: 'username',
        ca_uploaded_at: '2021-01-01T00:00:00Z',
      },
      networkError: null,
    };

    const action = setEmptySoftwareUpdatesSettings();

    const actual = softwareUpdatesSettingsReducer(initialState, action);

    expect(actual).toEqual({
      loading: false,
      settings: {
        url: undefined,
        username: undefined,
        ca_uploaded_at: undefined,
      },
      networkError: null,
    });
  });
});
