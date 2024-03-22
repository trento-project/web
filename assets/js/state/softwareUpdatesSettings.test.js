import softwareUpdatesSettingsReducer, {
  startLoadingSoftwareUpdatesSettings,
  setSoftwareUpdatesSettings,
  setEmptySoftwareUpdatesSettings,
  setSoftwareUpdatesSettingsErrors,
  setEditingSoftwareUpdatesSettings,
  setTestingSoftwareUpdatesConnection,
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
      errors: [],
    };

    const settings = {
      url: 'https://valid.url',
      username: 'username',
      ca_uploaded_at: '2021-01-01T00:00:00Z',
    };

    const action = setSoftwareUpdatesSettings(settings);

    const actual = softwareUpdatesSettingsReducer(initialState, action);

    expect(actual).toEqual({
      loading: false,
      settings,
      networkError: null,
      errors: [],
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
      errors: [],
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
      errors: [],
    });
  });

  it('should set errors upon validation failed', () => {
    const initialState = {
      loading: false,
      settings: {
        url: 'https://valid.url',
        username: 'username',
        ca_uploaded_at: '2021-01-01T00:00:00Z',
      },
      networkError: null,
      errors: [],
    };

    const errors = [
      {
        detail: "can't be blank",
        source: { pointer: '/url' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/ca_cert' },
        title: 'Invalid value',
      },
    ];

    const action = setSoftwareUpdatesSettingsErrors(errors);

    const actual = softwareUpdatesSettingsReducer(initialState, action);

    expect(actual).toEqual({
      loading: false,
      settings: {
        url: 'https://valid.url',
        username: 'username',
        ca_uploaded_at: '2021-01-01T00:00:00Z',
      },
      networkError: null,
      errors,
    });
  });

  it('should set the editing field to true', () => {
    const initialState = {
      loading: false,
      settings: {
        url: 'https://valid.url',
        username: 'username',
        ca_uploaded_at: '2021-01-01T00:00:00Z',
      },
      networkError: null,
      errors: [],
      editing: false,
    };

    const action = setEditingSoftwareUpdatesSettings(true);

    const actual = softwareUpdatesSettingsReducer(initialState, action);

    expect(actual).toEqual({
      ...initialState,
      editing: true,
    });
  });

  it('should mark that the connection is being tested', () => {
    const initialState = {
      loading: false,
      settings: {
        url: 'https://valid.url',
        username: 'username',
        ca_uploaded_at: '2021-01-01T00:00:00Z',
      },
      networkError: null,
      errors: [],
      editing: false,
      testingConnection: false,
    };

    [true, false].forEach((isTestingConnection) => {
      const action = setTestingSoftwareUpdatesConnection(isTestingConnection);

      const actual = softwareUpdatesSettingsReducer(initialState, action);

      expect(actual).toEqual({
        ...initialState,
        testingConnection: isTestingConnection,
      });
    });
  });
});
