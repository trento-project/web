// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

// safe to disable phoenix stuff
// eslint-disable-next-line
import { Socket } from 'phoenix';
import { logMessage, logError } from '@lib/log';
import { getAccessTokenFromStore, refreshAndStoreAccessToken } from '@lib/auth';

export const joinChannel = (channel) => {
  channel
    .join()
    .receive('ok', ({ messages }) => logMessage('catching up', messages))
    .receive('error', ({ reason }) => logError('failed join', reason))
    .receive('timeout', () => logMessage('Networking issue. Still waiting...'));
};

const getWebsocketParams = () => ({
  access_token: getAccessTokenFromStore(),
});

// Singleton socket instance
let socketInstance = null;

export const initSocketConnection = () => {
  // Return existing socket if already initialized
  if (socketInstance) {
    return socketInstance;
  }

  const socket = new Socket('/socket', {
    params: () => getWebsocketParams(),
  });
  socket.onError(async () => {
    logMessage(
      'socket error. trying to refresh the access token before reconnecting'
    );
    try {
      await refreshAndStoreAccessToken();
    } catch (error) {
      logError(
        'could not refresh access token for websocket connection',
        error
      );
      throw error;
    }
  });
  socket.connect();

  // Store singleton instance
  socketInstance = socket;

  return socket;
};

// Get existing socket instance (returns null if not initialized)
export const getSocketInstance = () => socketInstance;
