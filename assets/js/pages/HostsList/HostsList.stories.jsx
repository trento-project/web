import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import Component from './HostsList';

const hostListSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts: [],
  },
  reducers: {},
});

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
    profile: {
      abilities: [],
      timezone: 'UTC',
    },
  },
  reducers: {},
});

export default {
  title: 'Components/HostsList',
  component: Component,
  decorators: [
    (Story) => {
      const clusterListSlice = createSlice({
        name: 'clustersList',
        initialState: {
          clusters: [],
        },
        reducers: {},
      });

      const mockStore = configureStore({
        reducer: {
          hostsList: hostListSlice.reducer,
          clustersList: clusterListSlice.reducer,
          sapSystemsList: sapSystemsListSlice.reducer,
          databasesList: databasesListSlice.reducer,
          user: userSlice.reducer,
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
  argTypes: {
    id: {
      description: 'Identifier for the id',
      control: { type: 'text' },
    },
    hostname: {
      description: 'The hostname prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    id: 'host-123',
    hostname: 'prod-host-01',
  },
};
