import { runSaga } from 'redux-saga';

import { hostRegistered } from '@state/hosts';
import {
  updateLastExecution,
  setExecutionStarted,
} from '@state/lastExecutions';
import { userUpdated } from '@state/user';
import { alUsersPushed } from '@state/activityLog';

import { watchSocketEvents } from './channels';

const USER_ID = 1;

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
  [`users:${USER_ID}`]: new MockChannel(),
  [`activity_log:${USER_ID}`]: new MockChannel(),
};

const mockSocket = {
  channel: (channelName) => channels[channelName],
};

const runWatchSocketEventsSaga = (socket) => {
  const dispatched = [];

  const sagaExecution = runSaga(
    {
      dispatch: (action) => dispatched.push(action),
      getState: () => ({ user: { id: USER_ID } }),
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

  it('should listen to a specific user events', async () => {
    const { saga, dispatched } = runWatchSocketEventsSaga(mockSocket);

    channels[`users:${USER_ID}`].emit('user_updated', {
      email: 'new@email.com',
    });

    closeSocket();
    await saga;

    expect(dispatched).toEqual([userUpdated({ email: 'new@email.com' })]);
  });
  it('should listen to specific activity log events', async () => {
      const { saga, dispatched } = runWatchSocketEventsSaga(mockSocket);

      channels[`activity_log:${USER_ID}`].emit('al_users_pushed', {
        users: ["user1", "user2", "user3"],
      });

      closeSocket();
      await saga;

      expect(dispatched).toEqual([alUsersPushed({ users: ["user1", "user2", "user3"] })]);
    });
  });
