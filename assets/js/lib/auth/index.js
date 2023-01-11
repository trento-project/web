import axios from 'axios';

const STORAGE_ACCESS_TOKEN_IDENTIFIER = 'access_token';
const STORAGE_REFRESH_TOKEN_IDENTIFIER = 'refresh_token';

export const authClient = axios.create();

export const login = (credentials) =>
  authClient.post('/api/session', credentials).then((response) => {
    if (response.status !== 200) {
      throw Error('unauthorized', { cause: response.status });
    }
    return response;
  });

export const refreshAccessToken = (refreshToken) =>
  authClient
    .post('/api/session/refresh', { refresh_token: refreshToken })
    .then((response) => {
      if (response.status !== 200) {
        throw Error('unauthorized', { cause: response.status });
      }
      return response;
    });

export const me = (apiClient = authClient) =>
  apiClient.get('/api/me').then((response) => {
    if (response.status !== 200) {
      throw Error('unauthorized', { cause: response.status });
    }
    return response.data;
  });

export const storeAccessToken = (accessToken) => {
  window.localStorage.setItem(STORAGE_ACCESS_TOKEN_IDENTIFIER, accessToken);
};

export const storeRefreshToken = (refreshToken) => {
  window.localStorage.setItem(STORAGE_REFRESH_TOKEN_IDENTIFIER, refreshToken);
};

export const getAccessTokenFromStore = () =>
  window.localStorage.getItem(STORAGE_ACCESS_TOKEN_IDENTIFIER);

export const getRefreshTokenFromStore = () =>
  window.localStorage.getItem(STORAGE_REFRESH_TOKEN_IDENTIFIER);

export const clearCredentialsFromStore = () => {
  window.localStorage.removeItem(STORAGE_ACCESS_TOKEN_IDENTIFIER);
  window.localStorage.removeItem(STORAGE_REFRESH_TOKEN_IDENTIFIER);
};
