import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import sapSystemsHealthSummaryReducer from './healthSummary';
import hostsListReducer from './hosts';
import clustersListReducer from './clusters';
import checksSelectionReducer from './checksSelection';
import checksResultsFiltersReducer from './checksResultsFilters';
import sapSystemListReducer from './sapSystems';
import databasesListReducer from './databases';
import catalogReducer from './catalog';
import lastExecutionsReducer from './lastExecutions';
import userReducer from './user';
import softwareUpdatesReducer from './softwareUpdates';
import activityLogsSettingsReducer from './activityLogsSettings';
import activityLogReducer from './activityLog';
import runningOperationsReducer from './runningOperations';
import rootSaga from './sagas';

export const createStore = (router) => {
  const sagaMiddleware = createSagaMiddleware({
    context: {
      router,
    },
  });

  const store = configureStore({
    reducer: {
      sapSystemsHealthSummary: sapSystemsHealthSummaryReducer,
      hostsList: hostsListReducer,
      clustersList: clustersListReducer,
      checksSelection: checksSelectionReducer,
      checksResultsFilters: checksResultsFiltersReducer,
      sapSystemsList: sapSystemListReducer,
      databasesList: databasesListReducer,
      catalog: catalogReducer,
      lastExecutions: lastExecutionsReducer,
      user: userReducer,
      softwareUpdates: softwareUpdatesReducer,
      activityLogsSettings: activityLogsSettingsReducer,
      activityLog: activityLogReducer,
      runningOperations: runningOperationsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(sagaMiddleware),
  });

  sagaMiddleware.run(rootSaga);

  return store;
};
