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
import settingsReducer from './settings';
import userReducer from './user';
import softwareUpdatesReducer from './softwareUpdates';
import softwareUpdatesSettingsReducer from './softwareUpdatesSettings';
import activityLogsSettingsReducer from './activityLogsSettings';
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
      settings: settingsReducer,
      user: userReducer,
      softwareUpdates: softwareUpdatesReducer,
      softwareUpdatesSettings: softwareUpdatesSettingsReducer,
      activityLogsSettings: activityLogsSettingsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(sagaMiddleware),
  });

  sagaMiddleware.run(rootSaga);

  return store;
};
