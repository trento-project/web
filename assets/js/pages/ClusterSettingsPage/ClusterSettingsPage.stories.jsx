import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import MockAdapter from 'axios-mock-adapter';
import { networkClient } from '@lib/network';
import {
  abilityFactory,
  clusterFactory,
  userFactory,
  catalogFactory,
} from '@lib/test-utils/factories';
import ClusterSettingsPage from '.';

const cluster = clusterFactory.build({
  details: {
    hana_scenario: 'cost_optimized_3_tier',
    architecture_type: 'classic',
  },
});
const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });
const user = userFactory.build();
const catalog = catalogFactory.build();

const sapSystemsListSlice = createSlice({
  name: 'sapSystemsList',
  initialState: {
    sapSystems: [],
    applicationInstances: [],
  },
  reducers: {},
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    data: catalog.catalog || [],
    loading: false,
    error: null,
  },
  reducers: {},
});

const checksSelectionSlice = createSlice({
  name: 'checksSelection',
  initialState: {
    cluster: {
      [cluster.id]: {},
    },
    host: {},
  },
  reducers: {},
});

const lastExecutionsSlice = createSlice({
  name: 'lastExecutions',
  initialState: {
    [cluster.id]: null,
  },
  reducers: {},
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: user.username,
    email: user.email,
    abilities: [allAbility],
    timezone: 'Etc/UTC',
  },
  reducers: {},
});

const clusterListSlice = createSlice({
  name: 'clustersList',
  initialState: {
    clusters: [cluster],
  },
  reducers: {},
});

const hostListSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts: [],
  },
  reducers: {},
});

export default {
  title: 'Components/ClusterSettingsPage',
  component: ClusterSettingsPage,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          sapSystemsList: sapSystemsListSlice.reducer,
          clustersList: clusterListSlice.reducer,
          hostsList: hostListSlice.reducer,
          checksSelection: checksSelectionSlice.reducer,
          lastExecutions: lastExecutionsSlice.reducer,
          user: userSlice.reducer,
          catalog: catalogSlice.reducer,
        },
      });

      const axiosMock = new MockAdapter(networkClient);
      axiosMock.onPost(/\/checks\/env\/checks_selection/).reply(200, {
        data: catalog.catalog || [],
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={[`/clusters/${cluster.id}/settings`]}>
            <Routes>
              <Route path="/clusters/:clusterID/settings" element={<Story />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );
    },
  ],
  argTypes: {},
};

export const Default = {
  args: {},
};
