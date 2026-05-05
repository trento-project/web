import {
  abilityFactory,
  clusterFactory,
  databaseFactory,
  sapSystemFactory,
  userFactory,
} from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import ClustersList from './ClustersList';

const clusters = clusterFactory.buildList(3);
const sapSystems = sapSystemFactory.buildList(2);
const databases = databaseFactory.buildList(2);
const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });
const user = userFactory.build();

const clusterListSlice = createSlice({
  name: 'clustersList',
  initialState: {
    clusters,
  },
  reducers: {},
});

const sapSystemsListSlice = createSlice({
  name: 'sapSystemsList',
  initialState: {
    sapSystems,
    applicationInstances: [],
  },
  reducers: {},
});

const databasesListSlice = createSlice({
  name: 'databasesList',
  initialState: {
    databases,
    databaseInstances: [],
  },
  reducers: {},
});

const instanceSlice = createSlice({
  name: 'instances',
  initialState: {
    instances: {},
  },
  reducers: {},
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: user.username,
    email: user.email,
    profile: {
      abilities: [allAbility],
      timezone: 'Etc/UTC',
    },
  },
  reducers: {},
});

export default {
  title: 'Components/ClustersList',
  component: ClustersList,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          clustersList: clusterListSlice.reducer,
          sapSystemsList: sapSystemsListSlice.reducer,
          databasesList: databasesListSlice.reducer,
          instances: instanceSlice.reducer,
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
  argTypes: {},
};

export const Default = {
  args: {},
};
