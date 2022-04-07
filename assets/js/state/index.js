import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { Socket } from 'phoenix';

import { logMessage, logError } from '@lib/log';

import sapSystemsHealthSummaryReducer from './healthSummary';
import hostsListReducer from './hosts';
import clustersListReducer from './clusters';
import sapSystemListReducer from './sapSystems';
import databasesListReducer from './databases';
import catalogReducer from './catalog';
import liveFeedReducer from './liveFeed';

import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    sapSystemsHealthSummary: sapSystemsHealthSummaryReducer,
    hostsList: hostsListReducer,
    clustersList: clustersListReducer,
    sapSystemsList: sapSystemListReducer,
    databasesList: databasesListReducer,
    catalog: catalogReducer,
    liveFeed: liveFeedReducer,
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

const processChannelEvents = (store) => {
  const socket = new Socket('/socket', {});
  socket.connect();

  const hostsChannel = socket.channel('monitoring:hosts', {});
  const clustersChannel = socket.channel('monitoring:clusters', {});
  const sapSystemsChannel = socket.channel('monitoring:sap_systems', {});
  const databasesChannel = socket.channel('monitoring:databases', {});

  hostsChannel.on('host_registered', (payload) =>
    store.dispatch({ type: 'HOST_REGISTERED', payload })
  );

  hostsChannel.on('host_details_updated', (payload) =>
    store.dispatch({ type: 'HOST_DETAILS_UPDATED', payload })
  );

  hostsChannel.on('heartbeat_succeded', (payload) =>
    store.dispatch({ type: 'HEARTBEAT_SUCCEDED', payload })
  );

  hostsChannel.on('heartbeat_failed', (payload) =>
    store.dispatch({ type: 'HEARTBEAT_FAILED', payload })
  );

  clustersChannel.on('cluster_registered', (payload) =>
    store.dispatch({ type: 'CLUSTER_REGISTERED', payload })
  );

  clustersChannel.on('cluster_details_updated', (payload) =>
    store.dispatch({ type: 'CLUSTER_DETAILS_UPDATED', payload })
  );

  clustersChannel.on('checks_execution_started', (payload) =>
    store.dispatch({ type: 'CHECKS_EXECUTION_STARTED', payload })
  );

  clustersChannel.on('checks_execution_completed', (payload) =>
    store.dispatch({ type: 'CHECKS_EXECUTION_COMPLETED', payload })
  );

  clustersChannel.on('checks_results_updated', (payload) =>
    store.dispatch({ type: 'CHECKS_RESULTS_UPDATED', payload })
  );

  clustersChannel.on('cluster_health_changed', (payload) =>
    store.dispatch({ type: 'CLUSTER_HEALTH_CHANGED', payload })
  );

  clustersChannel.on('cluster_cib_last_written_updated', (payload) =>
    store.dispatch({ type: 'CLUSTER_CIB_LAST_WRITTEN_UPDATED', payload })
  );

  sapSystemsChannel.on('sap_system_registered', (payload) =>
    store.dispatch({ type: 'SAP_SYSTEM_REGISTERED', payload })
  );

  sapSystemsChannel.on('sap_system_health_changed', (payload) =>
    store.dispatch({ type: 'SAP_SYSTEM_HEALTH_CHANGED', payload })
  );

  sapSystemsChannel.on('application_instance_registered', (payload) =>
    store.dispatch({ type: 'APPLICATION_INSTANCE_REGISTERED', payload })
  );

  sapSystemsChannel.on('application_instance_health_changed', (payload) =>
    store.dispatch({ type: 'APPLICATION_INSTANCE_HEALTH_CHANGED', payload })
  );

  databasesChannel.on('database_registered', (payload) =>
    store.dispatch({ type: 'DATABASE_REGISTERED', payload })
  );

  databasesChannel.on('database_health_changed', (payload) =>
    store.dispatch({ type: 'DATABASE_HEALTH_CHANGED', payload })
  );

  databasesChannel.on('database_instance_registered', (payload) =>
    store.dispatch({ type: 'DATABASE_INSTANCE_REGISTERED', payload })
  );

  databasesChannel.on('database_instance_health_changed', (payload) =>
    store.dispatch({ type: 'DATABASE_INSTANCE_HEALTH_CHANGED', payload })
  );

  joinChannel(hostsChannel);
  joinChannel(clustersChannel);
  joinChannel(sapSystemsChannel);
  joinChannel(databasesChannel);
};

processChannelEvents(store);
