// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import {
  abilityFactory,
  hostFactory,
  userFactory,
} from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import HostsList from './HostsList';

const hosts = hostFactory.buildList(3);
const user = userFactory.build();
const abilities = abilityFactory.buildList(2);

const hostListSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts,
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
    username: user.username,
    email: user.email,
    profile: {
      abilities,
      timezone: 'Etc/UTC',
    },
  },
  reducers: {},
});

export default {
  title: 'Components/HostsList',
  component: HostsList,
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
    id: hosts[0].id,
    hostname: hosts[0].hostname,
  },
};
