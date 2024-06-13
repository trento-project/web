import { eventChannel } from 'redux-saga';
import { all, call, fork, put, take } from 'redux-saga/effects';

import { initSocketConnection, joinChannel } from '@lib/network/socket';

import {
  hostRegistered,
  hostDetailsUpdated,
  heartbeatSucceded,
  heartbeatFailed,
  hostDeregisterd,
  hostRestored,
  saptuneStatusUpdated,
  hostHelathChanged,
  hostSoftwareUpdatesDiscoveryCompleted,
} from '@state/hosts';

import {
  setExecutionStarted,
  updateLastExecution,
} from '@state/lastExecutions';

const hostEvents = [
  {
    name: 'host_registered',
    action: hostRegistered,
  },
  {
    name: 'host_details_updated',
    action: hostDetailsUpdated,
  },
  {
    name: 'heartbeat_succeded',
    action: heartbeatSucceded,
  },
  {
    name: 'heartbeat_failed',
    action: heartbeatFailed,
  },
  {
    name: 'host_deregistered',
    action: hostDeregisterd,
  },
  {
    name: 'host_restored',
    action: hostRestored,
  },
  {
    name: 'host_health_changed',
    action: hostHelathChanged,
  },
  {
    name: 'host_software_updates_discovery_completed',
    action: hostSoftwareUpdatesDiscoveryCompleted,
  },
  {
    name: 'saptune_status_updated',
    action: saptuneStatusUpdated,
  },
];

const executionEvents = [
  {
    name: 'execution_completed',
    action: updateLastExecution,
    transform: ({ group_id: groupID }) => groupID,
  },
  {
    name: 'execution_started',
    action: setExecutionStarted,
    transform: ({ group_id: groupID, targets }) => ({ groupID, targets }),
  },
];

const createEventChannel = (channel, events) =>
  eventChannel((emitter) => {
    events.forEach((event) => {
      channel.on(event.name, (payload) => {
        emitter({
          action: event.action,
          transform: event.transform,
          payload,
        });
      });
    });

    // Unsubscribe function
    return () => {};
  });

function* watchChannelEvents(socket, channelName, events) {
  const channel = yield call([socket, socket.channel], channelName, {});
  const eventsChannel = yield call(createEventChannel, channel, events);
  yield call(joinChannel, channel);

  while (true) {
    const {
      action,
      transform = (payload) => payload,
      payload,
    } = yield take(eventsChannel);
    yield put(action(transform(payload)));
  }
}

export function* watchEvents() {
  const socket = yield call(initSocketConnection);
  yield all([
    fork(watchChannelEvents, socket, 'monitoring:hosts', hostEvents),
    fork(watchChannelEvents, socket, 'monitoring:executions', executionEvents),
  ]);
}