import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { Socket } from 'phoenix';

import hostsListReducer from './hosts';

import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    hostsList: hostsListReducer,
  },
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(rootSaga);

const processChannelEvents = (store) => {
  const socket = new Socket('/socket', {});
  socket.connect();
  const channel = socket.channel('hosts:notifications', {});

  channel.on('host_registered', (payload) =>
    store.dispatch({ type: 'HOST_REGISTERED', payload })
  );

  channel.on('heartbeat_succeded', (payload) =>
    store.dispatch({ type: 'HEARTBEAT_SUCCEDED', payload })
  );

  channel.on('heartbeat_failed', (payload) =>
    store.dispatch({ type: 'HEARTBEAT_FAILED', payload })
  );

  channel
    .join()
    .receive('ok', ({ messages }) => console.log('catching up', messages))
    .receive('error', ({ reason }) => console.log('failed join', reason))
    .receive('timeout', () =>
      console.log('Networking issue. Still waiting...')
    );
};

processChannelEvents(store);
