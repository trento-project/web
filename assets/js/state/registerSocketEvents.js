import { logMessage, logError } from '@lib/log';

const joinChannel = (channel) => {
  channel
    .join()
    .receive('ok', ({ messages }) => logMessage('catching up', messages))
    .receive('error', ({ reason }) => logError('failed join', reason))
    .receive('timeout', () => logMessage('Networking issue. Still waiting...'));
};

const registerEvents = (store, socket, channelName, events) => {
  const channel = socket.channel(channelName, {});

  for (const event of events) {
    channel.on(event, (payload) =>
      store.dispatch({ type: event.toUpperCase(), payload })
    );
  }

  joinChannel(channel);
};

export default registerEvents;
