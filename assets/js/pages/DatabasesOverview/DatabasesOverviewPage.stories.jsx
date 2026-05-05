import React from 'react';
import { action } from 'storybook/actions';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import Component from './DatabasesOverviewPage';

const databasesListSlice = createSlice({
  name: 'databasesList',
  initialState: {
    databases: [],
    databaseInstances: [],
    loading: false,
  },
  reducers: {},
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: 'testuser',
    email: 'test@example.com',
    abilities: [],
    timezone: 'UTC',
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

const clusterListSlice = createSlice({
  name: 'clustersList',
  initialState: {
    clusters: [],
  },
  reducers: {},
});

export default {
  title: 'Components/DatabasesOverviewPage',
  component: Component,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
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
  argTypes: {
    databases: {
      description: 'Array of items for the databases',
      control: { type: 'object' },
    },
    databaseInstances: {
      description: 'Array of items for the databaseInstances',
      control: { type: 'object' },
    },
    loading: {
      description: 'Whether the data is loading',
      control: { type: 'boolean' },
    },
    userAbilities: {
      description: 'Array of user abilities',
      control: { type: 'object' },
    },
    onTagAdd: {
      description: 'Callback function invoked when tag add',
      action: 'onTagAdd',
    },
    onTagRemove: {
      description: 'Callback function invoked when tag remove',
      action: 'onTagRemove',
    },
    onInstanceCleanUp: {
      description: 'Callback function invoked when instance clean up',
      action: 'onInstanceCleanUp',
    },
  },
};

export const Default = {
  args: {
    databases: [],
    databaseInstances: [],
    loading: false,
    userAbilities: [],
    onTagAdd: action('onTagAdd'),
    onTagRemove: action('onTagRemove'),
    onInstanceCleanUp: action('onInstanceCleanUp'),
  },
};
