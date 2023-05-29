import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import sapSystemsHealthSummaryReducer from './healthSummary';
import hostsListReducer from './hosts';
import clustersListReducer from './clusters';
import clusterChecksSelectionReducer from './clusterChecksSelection';
import checksResultsFiltersReducer from './checksResultsFilters';
import sapSystemListReducer from './sapSystems';
import databasesListReducer from './databases';
import catalogReducer from './catalog';
import lastExecutionsReducer from './lastExecutions';
import liveFeedReducer from './liveFeed';
import settingsReducer from './settings';
import userReducer from './user';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    sapSystemsHealthSummary: sapSystemsHealthSummaryReducer,
    hostsList: hostsListReducer,
    clustersList: clustersListReducer,
    clusterChecksSelection: clusterChecksSelectionReducer,
    checksResultsFilters: checksResultsFiltersReducer,
    sapSystemsList: sapSystemListReducer,
    databasesList: databasesListReducer,
    catalog: catalogReducer,
    lastExecutions: lastExecutionsReducer,
    liveFeed: liveFeedReducer,
    settings: settingsReducer,
    user: userReducer,
  },
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(rootSaga);
