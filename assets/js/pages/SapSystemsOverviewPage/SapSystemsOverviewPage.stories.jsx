// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import {
  abilityFactory,
  databaseFactory,
  sapSystemFactory,
  userFactory,
} from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import SapSystemsOverviewPage from './SapSystemsOverviewPage';

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });
const user = userFactory.build();

const sapSystemsListSlice = createSlice({
  name: 'sapSystemsList',
  initialState: {
    sapSystems: sapSystemFactory.buildList(3),
    applicationInstances: [],
  },
  reducers: {},
});

const databasesListSlice = createSlice({
  name: 'databasesList',
  initialState: {
    databases: databaseFactory.buildList(2),
    databaseInstances: [],
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

export default {
  title: 'Components/SapSystemsOverviewPage',
  component: SapSystemsOverviewPage,
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
