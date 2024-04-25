// safe to disable phoenix stuff
// eslint-disable-next-line
import { Socket } from 'phoenix';
import { logMessage, logError } from '@lib/log';
import {
  getAccessTokenFromStore,
  getRefreshTokenFromStore,
  refreshAccessToken,
  storeAccessToken,
} from '@lib/auth';

export const joinChannel = (channel) => {
  channel
    .join()
    .receive('ok', ({ messages }) => logMessage('catching up', messages))
    .receive('error', ({ reason }) => logError('failed join', reason))
    .receive('timeout', () => logMessage('Networking issue. Still waiting...'));
};

const refreshAuthTokenForSocket = async () => {
  const refreshToken = getRefreshTokenFromStore();
  if (!refreshToken) {
    logError(
      'could not refresh the access token for websockets, refresh token not found'
    );
    throw new Error('could not refresh access token for websocket connection');
  }

  const {
    data: { access_token: accessToken },
  } = await refreshAccessToken(refreshToken);
  storeAccessToken(accessToken);
};

const getWebsocketParams = () => ({
  access_token: getAccessTokenFromStore(),
});

export const initSocketConnection = () => {
  const socket = new Socket('/socket', {
    params: () => getWebsocketParams(),
  });
  socket.onError(async () => {
    logMessage(
      'socket error. trying to refresh the access token before reconnecting'
    );
    await refreshAuthTokenForSocket();
  });
  socket.connect();

  return socket;
};
