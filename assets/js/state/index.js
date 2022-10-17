import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { Socket } from 'phoenix';

import { logMessage, logError } from '@lib/log';

import sapSystemsHealthSummaryReducer from './healthSummary';
import hostsListReducer from './hosts';
import clustersListReducer from './clusters';
import clusterConnectionsSettingsReducer from './clusterConnectionSettings';
import clusterChecksSelectionReducer from './clusterChecksSelection';
import sapSystemListReducer from './sapSystems';
import databasesListReducer from './databases';
import catalogReducer from './catalog';
import liveFeedReducer from './liveFeed';
import settingsReducer from './settings';

import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    sapSystemsHealthSummary: sapSystemsHealthSummaryReducer,
    hostsList: hostsListReducer,
    clustersList: clustersListReducer,
    clusterConnectionSettings: clusterConnectionsSettingsReducer,
    clusterChecksSelection: clusterChecksSelectionReducer,
    sapSystemsList: sapSystemListReducer,
    databasesList: databasesListReducer,
    catalog: catalogReducer,
    liveFeed: liveFeedReducer,
    settings: settingsReducer,
  },
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(rootSaga);

const joinChannel = (channel) => {
  channel
    .join()
    .receive('ok', ({ messages }) => logMessage('catching up', messages))
    .receive('error', ({ reason }) => logError('failed join', reason))
    .receive('timeout', () => logMessage('Networking issue. Still waiting...'));
};

const registerEvents = (socket, channelName, events) => {
  const channel = socket.channel(channelName, {});

  for (const event of events) {
    channel.on(event, (payload) =>
      store.dispatch({ type: event.toUpperCase(), payload })
    );
  }

  joinChannel(channel);
};

const processChannelEvents = () => {
  const socket = new Socket('/socket', {});
  socket.connect();

  registerEvents(socket, 'monitoring:hosts', [
    'host_registered',
    'host_details_updated',
    'heartbeat_succeded',
    'heartbeat_failed',
  ]);
  registerEvents(socket, 'monitoring:clusters', [
    'cluster_registered',
    'cluster_details_updated',
    'checks_execution_started',
    'checks_execution_completed',
    'checks_results_updated',
    'cluster_health_changed',
    'cluster_cib_last_written_updated',
  ]);
  registerEvents(socket, 'monitoring:sap_systems', [
    'sap_system_registered',
    'sap_system_health_changed',
    'application_instance_registered',
    'application_instance_health_changed',
  ]);
  registerEvents(socket, 'monitoring:databases', [
    'database_registered',
    'database_health_changed',
    'database_instance_registered',
    'database_instance_health_changed',
    'database_instance_system_replication_changed',
  ]);
};

processChannelEvents(store);
