import MockAdapter from 'axios-mock-adapter';
import { recordSaga } from '@lib/test-utils';
import {
  authClient,
  getAccessTokenFromStore,
  getRefreshTokenFromStore,
} from '@lib/auth';
import {
  setAuthInProgress,
  setAuthError,
  setUser,
  setUserAsLogged,
} from '@state/user';
import { performLogin } from './user';

const axiosMock = new MockAdapter(authClient);

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
      setAuthError({ error: 'Request failed with status code 401' })
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

    axiosMock
      .onPost('/api/session', { username: 'good', password: 'good' })
      .reply(200, credentialResponse);

    const dispatched = await recordSaga(performLogin, {
      payload: {
        username: 'good',
        password: 'good',
      },
    });

    expect(dispatched).toContainEqual(setAuthInProgress());
    expect(dispatched).toContainEqual(setUser({ username: 'good' }));
    expect(dispatched).toContainEqual(setUserAsLogged());

    expect(getAccessTokenFromStore()).toEqual(credentialResponse.access_token);
    expect(getRefreshTokenFromStore()).toEqual(
      credentialResponse.refresh_token
    );
  });
});
