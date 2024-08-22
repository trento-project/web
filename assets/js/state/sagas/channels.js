import { eventChannel, END } from 'redux-saga';
import { all, call, fork, put, select, take } from 'redux-saga/effects';

import { joinChannel } from '@lib/network/socket';

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
  clusterRegistered,
  clusterDetailsUpdated,
  clusterHealthChanged,
  clusterCibLastWrittenUpdated,
  clusterDeregistered,
  clusterRestored,
} from '@state/clusters';

import {
  sapSystemRegistered,
  sapSystemHealthChanged,
  applicationInstanceRegistered,
  applicationInstanceMoved,
  applicationInstanceAbsentAtChanged,
  applicationInstanceDeregistered,
  applicationInstanceHealthChanged,
  sapSystemDeregistered,
  sapSystemRestored,
  sapSystemUpdated,
} from '@state/sapSystems';

import {
  databaseRegistered,
  databaseDeregistered,
  databaseRestored,
  databaseHealthChanged,
  databaseInstanceRegistered,
  databaseInstanceAbsentAtChanged,
  databaseInstanceDeregistered,
  databaseInstanceHealthChanged,
  databaseInstanceSystemReplicationChanged,
} from '@state/databases';

import {
  setExecutionStarted,
  updateLastExecution,
} from '@state/lastExecutions';

import { userUpdated, userLocked, userDeleted } from '@state/user';
import { alUsersPushed } from '@state/activityLog';

import { getUserProfile } from '@state/selectors/user';

const CLOSE_CHANNEL_EVENT = 'close';

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

const clusterEvents = [
  {
    name: 'cluster_registered',
    action: clusterRegistered,
  },
  {
    name: 'cluster_details_updated',
    action: clusterDetailsUpdated,
  },
  {
    name: 'cluster_health_changed',
    action: clusterHealthChanged,
  },
  {
    name: 'cluster_cib_last_written_updated',
    action: clusterCibLastWrittenUpdated,
  },
  {
    name: 'cluster_deregistered',
    action: clusterDeregistered,
  },
  {
    name: 'cluster_restored',
    action: clusterRestored,
  },
];

const sapSystemEvents = [
  {
    name: 'sap_system_registered',
    action: sapSystemRegistered,
  },
  {
    name: 'sap_system_health_changed',
    action: sapSystemHealthChanged,
  },
  {
    name: 'application_instance_registered',
    action: applicationInstanceRegistered,
  },
  {
    name: 'application_instance_moved',
    action: applicationInstanceMoved,
  },
  {
    name: 'application_instance_absent_at_changed',
    action: applicationInstanceAbsentAtChanged,
  },
  {
    name: 'application_instance_deregistered',
    action: applicationInstanceDeregistered,
  },
  {
    name: 'application_instance_health_changed',
    action: applicationInstanceHealthChanged,
  },
  {
    name: 'sap_system_deregistered',
    action: sapSystemDeregistered,
  },
  {
    name: 'sap_system_restored',
    action: sapSystemRestored,
  },
  {
    name: 'sap_system_updated',
    action: sapSystemUpdated,
  },
];

const databaseEvents = [
  {
    name: 'database_registered',
    action: databaseRegistered,
  },
  {
    name: 'database_deregistered',
    action: databaseDeregistered,
  },
  {
    name: 'database_restored',
    action: databaseRestored,
  },
  {
    name: 'database_health_changed',
    action: databaseHealthChanged,
  },
  {
    name: 'database_instance_registered',
    action: databaseInstanceRegistered,
  },
  {
    name: 'database_instance_absent_at_changed',
    action: databaseInstanceAbsentAtChanged,
  },
  {
    name: 'database_instance_deregistered',
    action: databaseInstanceDeregistered,
  },
  {
    name: 'database_instance_health_changed',
    action: databaseInstanceHealthChanged,
  },
  {
    name: 'database_instance_system_replication_changed',
    action: databaseInstanceSystemReplicationChanged,
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

const userEvents = [
  {
    name: 'user_updated',
    action: userUpdated,
  },
  {
    name: 'user_locked',
    action: userLocked,
  },
  {
    name: 'user_deleted',
    action: userDeleted,
  },
];

const activityLogEvents = [
  {
    name: 'al_users_pushed',
    action: alUsersPushed,
  }
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

    channel.on(CLOSE_CHANNEL_EVENT, () => {
      emitter(END);
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

export function* watchSocketEvents(socket) {
  const { id: userID } = yield select(getUserProfile);

  yield all([
    fork(watchChannelEvents, socket, 'monitoring:hosts', hostEvents),
    fork(watchChannelEvents, socket, 'monitoring:clusters', clusterEvents),
    fork(watchChannelEvents, socket, 'monitoring:sap_systems', sapSystemEvents),
    fork(watchChannelEvents, socket, 'monitoring:databases', databaseEvents),
    fork(watchChannelEvents, socket, 'monitoring:executions', executionEvents),
    fork(watchChannelEvents, socket, `users:${userID}`, userEvents),
    fork(watchChannelEvents, socket, `activity_log:${userID}`, activityLogEvents),
  ]);
}
