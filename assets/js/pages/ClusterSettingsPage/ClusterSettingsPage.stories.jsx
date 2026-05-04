import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import Component from './ClusterSettingsPage';

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
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

const checksSelectionSlice = createSlice({
  name: 'checksSelection',
  initialState: {
    cluster: {
      123: {},
    },
    host: {},
  },
  reducers: {},
});

const lastExecutionsSlice = createSlice({
  name: 'lastExecutions',
  initialState: {
    123: null,
  },
  reducers: {},
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: 'testuser',
    email: 'test@example.com',
    abilities: [{ name: 'all', resource: 'all' }],
    timezone: 'UTC',
  },
  reducers: {},
});

const clusterListSlice = createSlice({
  name: 'clustersList',
  initialState: {
    clusters: [
      {
        id: '123',
        name: 'Cluster-01',
      },
    ],
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
  component: Component,
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

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={['/clusters/123/settings']}>
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
