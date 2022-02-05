import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { Socket } from 'phoenix';

import hostsListReducer from './hosts';
import clustersListReducer from './clusters';
import catalogReducer from './catalog';
import liveFeedReducer from './liveFeed';

import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    hostsList: hostsListReducer,
    clustersList: clustersListReducer,
    catalog: catalogReducer,
    liveFeed: liveFeedReducer,
  },
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(rootSaga);

const joinChannel = (channel) => {
  channel
    .join()
    .receive('ok', ({ messages }) => console.log('catching up', messages))
    .receive('error', ({ reason }) => console.log('failed join', reason))
    .receive('timeout', () =>
      console.log('Networking issue. Still waiting...')
    );
};

const processChannelEvents = (store) => {
  const socket = new Socket('/socket', {});
  socket.connect();

  const hostsChannel = socket.channel('monitoring:hosts', {});
  const clustersChannel = socket.channel('monitoring:clusters', {});

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

  joinChannel(hostsChannel);
  joinChannel(clustersChannel);
};

processChannelEvents(store);
