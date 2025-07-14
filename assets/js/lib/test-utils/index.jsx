/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router';
import configureStore from 'redux-mock-store';
import { runSaga } from 'redux-saga';

import hosts from './data/hosts';
import clusters from './data/clusters';
import sapSystems from './data/sapSystems';
import databases from './data/databases';

const middlewares = [];
const mockStore = configureStore(middlewares);

export const defaultInitialState = {
  activityLog: {
    users: [],
  },
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

export const hookWrapperWithState = (initialState = defaultInitialState) => {
  const store = mockStore(initialState);

  return [
    function hookStateWrapper({ children }) {
      return (
        <Provider key="root" store={store}>
          {children}
        </Provider>
      );
    },
    store,
  ];
};

export const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  function Router({ children }) {
    return (
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
          v7_fetcherPersist: true,
          v7_normalizeFormMethod: true,
          v7_partialHydration: true,
          v7_skipActionErrorRevalidation: true,
        }}
      >
        {children}
      </BrowserRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Router }),
  };
};

export function renderWithRouterMatch(ui, { path = '/', route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return {
    ...render(
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
          v7_fetcherPersist: true,
          v7_normalizeFormMethod: true,
          v7_partialHydration: true,
          v7_skipActionErrorRevalidation: true,
        }}
      >
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
