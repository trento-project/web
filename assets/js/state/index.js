import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
// safe to disable phoenix stuff
// eslint-disable-next-line
import { Socket } from 'phoenix';

import { updateLastExecution } from '@state/actions/lastExecutions';
import sapSystemsHealthSummaryReducer from './healthSummary';
import hostsListReducer from './hosts';
import clustersListReducer from './clusters';
import clusterConnectionsSettingsReducer from './clusterConnectionSettings';
import clusterChecksSelectionReducer from './clusterChecksSelection';
import sapSystemListReducer from './sapSystems';
import databasesListReducer from './databases';
import catalogReducer from './catalog';
import catalogNewReducer from './catalogNew';
import lastExecutionsReducer from './lastExecutions';
import liveFeedReducer from './liveFeed';
import settingsReducer from './settings';
import userReducer from './user';
import registerEvents, { joinChannel } from './registerSocketEvents';

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
    catalogNew: catalogNewReducer,
    lastExecutions: lastExecutionsReducer,
    liveFeed: liveFeedReducer,
    settings: settingsReducer,
    user: userReducer,
  },
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(rootSaga);

const processChannelEvents = (reduxStore) => {
  const socket = new Socket('/socket', {});
  socket.connect();

  registerEvents(reduxStore, socket, 'monitoring:hosts', [
    'host_registered',
    'host_details_updated',
    'heartbeat_succeded',
    'heartbeat_failed',
  ]);
  registerEvents(reduxStore, socket, 'monitoring:clusters', [
    'cluster_registered',
    'cluster_details_updated',
    'checks_execution_started',
    'checks_execution_completed',
    'checks_results_updated',
    'cluster_health_changed',
    'cluster_cib_last_written_updated',
  ]);
  registerEvents(reduxStore, socket, 'monitoring:sap_systems', [
    'sap_system_registered',
    'sap_system_health_changed',
    'application_instance_registered',
    'application_instance_health_changed',
  ]);
  registerEvents(reduxStore, socket, 'monitoring:databases', [
    'database_registered',
    'database_health_changed',
    'database_instance_registered',
    'database_instance_health_changed',
    'database_instance_system_replication_changed',
  ]);

  // FIXME: This is to overcome the fact that we are generating names with registerEvents
  // in the future we want to remove this and use the constants directly,
  // since events and actions may have different names and parameters.
  const channel = socket.channel('monitoring:executions', {});
  channel.on('execution_completed', ({ group_id: groupID }) => {
    store.dispatch(updateLastExecution(groupID));
  });

  joinChannel(channel);
};

processChannelEvents(store);
