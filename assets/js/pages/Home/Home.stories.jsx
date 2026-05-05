import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import {
  clusterFactory,
  hostFactory,
  abilityFactory,
} from '@lib/test-utils/factories';
import Home from '.';

const clusters = clusterFactory.buildList(3);
const hosts = hostFactory.buildList(5);
const abilities = abilityFactory.buildList(2);

const clusterSlice = createSlice({
  name: 'cluster',
  initialState: {
    clusters,
  },
  reducers: {},
});

const hostsSlice = createSlice({
  name: 'hosts',
  initialState: {
    hosts,
  },
  reducers: {},
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: {
      abilities,
      timezone: 'Etc/UTC',
    },
  },
  reducers: {},
});

const sapSystemsHealthSummarySlice = createSlice({
  name: 'sapSystemsHealthSummary',
  initialState: {
    loading: false,
    sapSystemsHealth: [],
  },
  reducers: {},
});

export default {
  title: 'Components/Home',
  component: Home,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          cluster: clusterSlice.reducer,
          hosts: hostsSlice.reducer,
          user: userSlice.reducer,
          sapSystemsHealthSummary: sapSystemsHealthSummarySlice.reducer,
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
