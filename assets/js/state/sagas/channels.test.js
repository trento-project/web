import { runSaga } from 'redux-saga';

import { hostRegistered } from '@state/hosts';
import {
  updateLastExecution,
  setExecutionStarted,
} from '@state/lastExecutions';

import { watchSocketEvents } from './channels';

const mockJoinedChannel = {
  receive: () => mockJoinedChannel,
};

class MockChannel {
  constructor() {
    this.subs = [];
    this.count = 0;
  }

  on(name, listener) {
    this.subs.push({
      name,
      listener,
      id: (this.count += 1),
    });
  }

  emit(event_name, payload) {
    this.subs.forEach(({ name, listener }) => {
      if (name === event_name) listener(payload);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  join() {
    return mockJoinedChannel;
  }
}

const channels = {
  'monitoring:hosts': new MockChannel(),
  'monitoring:clusters': new MockChannel(),
  'monitoring:sap_systems': new MockChannel(),
  'monitoring:databases': new MockChannel(),
  'monitoring:executions': new MockChannel(),
};

const mockSocket = {
  channel: (channelName) => channels[channelName],
};

const runWatchSocketEventsSaga = (socket) => {
  const dispatched = [];

  const sagaExecution = runSaga(
    {
      dispatch: (action) => dispatched.push(action),
    },
    watchSocketEvents,
    socket
  ).toPromise();

  return { saga: sagaExecution, dispatched };
};

const closeSocket = () =>
  Object.values(channels).forEach((channel) => channel.emit('close'));

describe('Channels saga', () => {
  it('should listen to events', async () => {
    const { saga, dispatched } = runWatchSocketEventsSaga(mockSocket);

    channels['monitoring:hosts'].emit('host_registered', { key: 'value' });

    closeSocket();
    await saga;

    expect(dispatched).toEqual([hostRegistered({ key: 'value' })]);
  });

  it('should listen and transform execution_completed event', async () => {
    const { saga, dispatched } = runWatchSocketEventsSaga(mockSocket);

    channels['monitoring:executions'].emit('execution_completed', {
      group_id: 'group',
    });

    closeSocket();
    await saga;

    expect(dispatched).toEqual([updateLastExecution('group')]);
  });

  it('should listen and transform execution_started event', async () => {
    const { saga, dispatched } = runWatchSocketEventsSaga(mockSocket);

    channels['monitoring:executions'].emit('execution_started', {
      group_id: 'group',
      targets: [],
    });

    closeSocket();
    await saga;

    expect(dispatched).toEqual([
      setExecutionStarted({ groupID: 'group', targets: [] }),
    ]);
  });
});
