import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import Component from './SapSystemsOverviewPage';

const sapSystemsListSlice = createSlice({
  name: 'sapSystemsList',
  initialState: {
    sapSystems: [],
    applicationInstances: [],
  },
  reducers: {},
});

const databasesListSlice = createSlice({
  name: 'databasesList',
  initialState: {
    databases: [],
    databaseInstances: [],
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

export default {
  title: 'Components/SapSystemsOverviewPage',
  component: Component,
  decorators: [
    (Story) => {
      const hostListSlice = createSlice({
        name: 'hostsList',
        initialState: {
          hosts: [],
        },
        reducers: {},
      });

      const clusterListSlice = createSlice({
        name: 'clustersList',
        initialState: {
          clusters: [],
        },
        reducers: {},
      });

      const mockStore = configureStore({
        reducer: {
          sapSystemsList: sapSystemsListSlice.reducer,
          databasesList: databasesListSlice.reducer,
          user: userSlice.reducer,
          hostsList: hostListSlice.reducer,
          clustersList: clusterListSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter>
            <Story />
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
