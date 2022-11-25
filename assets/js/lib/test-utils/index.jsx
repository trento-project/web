import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { runSaga } from 'redux-saga';

import hosts from './data/hosts';
import clusters from './data/clusters';
import sapSystems from './data/sapSystems';

const middlewares = [];
const mockStore = configureStore(middlewares);

const defaultInitialState = {
  hostsList: { hosts: hosts },
  clustersList: { clusters: clusters },
  sapSystemsList: {
    sapSystems: sapSystems,
    applicationInstances: sapSystems.flatMap(
      (sapSystem) => sapSystem.application_instances
    ),
    databaseInstances: sapSystems.flatMap(
      (sapSystem) => sapSystem.database_instances
    ),
  },
};

export const withState = (component, initialState = {}) => {
  const store = mockStore(initialState);

  return [
    <Provider key="root" store={store}>
      {component}
    </Provider>,
    store,
  ];
};

export const withDefaultState = (component) => {
  return withState(component, defaultInitialState);
};

export const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return {
    ...render(ui, { wrapper: BrowserRouter }),
  };
};

export async function recordSaga(saga, initialAction) {
  const dispatched = [];

  await runSaga(
    {
      dispatch: (action) => dispatched.push(action),
    },
    saga,
    initialAction
  ).toPromise();

  return dispatched;
}
