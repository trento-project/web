import React from 'react';
import { action } from 'storybook/actions';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import {
  databaseFactory,
  clusterFactory,
  hostFactory,
  abilityFactory,
  userFactory,
} from '@lib/test-utils/factories';
import DatabasesOverview from '.';

const databases = databaseFactory.buildList(2);
const clusterListData = clusterFactory.buildList(2);
const hostListData = hostFactory.buildList(2);
const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });
const user = userFactory.build();

const databasesListSlice = createSlice({
  name: 'databasesList',
  initialState: {
    databases,
    databaseInstances: [],
    loading: false,
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

const hostListSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts: hostListData,
  },
  reducers: {},
});

const clusterListSlice = createSlice({
  name: 'clustersList',
  initialState: {
    clusters: clusterListData,
  },
  reducers: {},
});

export default {
  title: 'Components/DatabasesOverviewPage',
  component: DatabasesOverview,
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
    databases,
    databaseInstances: [],
    loading: false,
    userAbilities: [allAbility],
    onTagAdd: action('onTagAdd'),
    onTagRemove: action('onTagRemove'),
    onInstanceCleanUp: action('onInstanceCleanUp'),
  },
};
