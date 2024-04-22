// safe to disable phoenix stuff
// eslint-disable-next-line
import { Socket } from 'phoenix';
import { logMessage, logError } from '@lib/log';
import { getAccessTokenFromStore } from '@lib/auth';

export const joinChannel = (channel) => {
  channel
    .join()
    .receive('ok', ({ messages }) => logMessage('catching up', messages))
    .receive('error', ({ reason }) => logError('failed join', reason))
    .receive('timeout', () => logMessage('Networking issue. Still waiting...'));
};

export const initSocketConnection = () => {
  const socket = new Socket('/socket', {
    params: { access_token: getAccessTokenFromStore() },
  });
  socket.connect();

  return socket;
};
