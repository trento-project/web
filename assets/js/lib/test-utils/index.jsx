/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { runSaga } from 'redux-saga';

import hosts from './data/hosts';
import clusters from './data/clusters';
import sapSystems from './data/sapSystems';
import databases from './data/databases';

const middlewares = [];
const mockStore = configureStore(middlewares);

export const defaultInitialState = {
  user: {
    abilities: [{ name: 'all', resource: 'all' }],
  },
  hostsList: { hosts },
  clustersList: { clusters },
  sapSystemsList: {
    sapSystems,
    applicationInstances: sapSystems.flatMap(
      (sapSystem) => sapSystem.application_instances
    ),
    databaseInstances: sapSystems.flatMap(
      (sapSystem) => sapSystem.database_instances
    ),
  },
  databasesList: {
    databases,
    databaseInstances: databases.flatMap(
      (database) => database.database_instances
    ),
  },
  checksSelection: { host: {}, cluster: {} },
  catalog: { loading: false, data: [], error: null },
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

export const withDefaultState = (component) =>
  withState(component, defaultInitialState);

export const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return {
    ...render(ui, { wrapper: BrowserRouter }),
  };
};

export function renderWithRouterMatch(ui, { path = '/', route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return {
    ...render(
      <BrowserRouter>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </BrowserRouter>
    ),
  };
}

export async function recordSaga(
  saga,
  initialAction,
  state = {},
  context = {}
) {
  const dispatched = [];

  await runSaga(
    {
      dispatch: (action) => dispatched.push(action),
      getState: () => state,
      context,
    },
    saga,
    initialAction
  ).toPromise();

  return dispatched;
}

export const inspect = (val) => {
  console.dir(val); // eslint-disable-line no-console
  return val;
};
