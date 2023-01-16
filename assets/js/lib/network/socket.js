// safe to disable phoenix stuff
// eslint-disable-next-line
import { Socket } from 'phoenix';
import { logMessage, logError } from '@lib/log';

export const joinChannel = (channel) => {
  channel
    .join()
    .receive('ok', ({ messages }) => logMessage('catching up', messages))
    .receive('error', ({ reason }) => logError('failed join', reason))
    .receive('timeout', () => logMessage('Networking issue. Still waiting...'));
};

export const initSocketConnection = () => {
  const socket = new Socket('/socket', {});
  socket.connect();

  return socket;
};
