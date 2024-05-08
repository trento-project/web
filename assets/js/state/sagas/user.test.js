import MockAdapter from 'axios-mock-adapter';
import { recordSaga } from '@lib/test-utils';
import {
  authClient,
  getAccessTokenFromStore,
  getRefreshTokenFromStore,
  storeRefreshToken,
  storeAccessToken,
} from '@lib/auth';
import {
  setAuthInProgress,
  setAuthError,
  setUser,
  setUserAsLogged,
} from '@state/user';
import { networkClient } from '@lib/network';
import { userFactory } from '@lib/test-utils/factories/users';
import { performLogin, clearUserAndLogout } from './user';

const axiosMock = new MockAdapter(authClient);
const networkClientAxiosMock = new MockAdapter(networkClient);

describe('user actions saga', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
  });

  it('should clear the storage in clearUserAndLogout saga', async () => {
    storeAccessToken('access_token');
    storeRefreshToken('refresh_token');

    await recordSaga(clearUserAndLogout);

    expect(getAccessTokenFromStore()).toEqual(null);
    expect(getRefreshTokenFromStore()).toEqual(null);
  });
});

describe('user login saga', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
  });

  it('should set the error when the login fails', async () => {
    axiosMock
      .onPost('/api/session', { username: 'bad', password: 'bad' })
      .reply(401, {
        error: 'unauthorized',
      });

    const dispatched = await recordSaga(performLogin, {
      payload: {
        username: 'bad',
        password: 'bad',
      },
    });

    expect(dispatched).toContainEqual(setAuthInProgress());
    expect(dispatched).toContainEqual(
      setAuthError({
        message: 'Request failed with status code 401',
        code: 401,
      })
    );
    expect(getAccessTokenFromStore()).toEqual(null);
    expect(getRefreshTokenFromStore()).toEqual(null);
  });

  it('should set the username in the store and set the user as logged when login is successful, persisting the information in the local storage', async () => {
    const credentialResponse = {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTY0MTE5NiwiaWF0IjoxNjcxNjQwNTk2LCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwZG9ndmxtOTJmdG1kdm1nMDAwbmExIiwibmJmIjoxNjcxNjQwNTk2LCJzdWIiOjEsInR5cCI6IkJlYXJlciJ9.ZuHORuLkK9e15NGGMRRpxFOUR1BO1_BLuT9EeOJfuLM',
      expires_in: 600,
      refresh_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTY0MDY1NiwiaWF0IjoxNjcxNjQwNTk2LCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwZG9ndmxtZWhmbG1kdm1nMDAwbmMxIiwibmJmIjoxNjcxNjQwNTk2LCJzdWIiOjEsInR5cCI6IlJlZnJlc2gifQ.AW6-iV1XHWdzQKBVadhf7o7gUdidYg6mEyyuDke_zlA',
    };

    const { email, username, id, fullname, created_at, updated_at } =
      userFactory.build();

    axiosMock
      .onPost('/api/session', { username, password: 'good' })
      .reply(200, credentialResponse);

    networkClientAxiosMock
      .onGet('/api/v1/profile')
      .reply(200, { username, id, email, fullname, created_at, updated_at });

    const dispatched = await recordSaga(performLogin, {
      payload: {
        username,
        password: 'good',
      },
    });

    expect(dispatched).toContainEqual(setAuthInProgress());
    expect(dispatched).toContainEqual(
      setUser({ username, id, email, fullname, created_at, updated_at })
    );
    expect(dispatched).toContainEqual(setUserAsLogged());

    expect(getAccessTokenFromStore()).toEqual(credentialResponse.access_token);
    expect(getRefreshTokenFromStore()).toEqual(
      credentialResponse.refresh_token
    );
  });
});
