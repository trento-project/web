import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import Component from './Home';

const clusterSlice = createSlice({
  name: 'cluster',
  initialState: {
    clusters: [],
  },
  reducers: {},
});

const hostsSlice = createSlice({
  name: 'hosts',
  initialState: {
    hosts: [],
  },
  reducers: {},
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: {
      abilities: [],
      timezone: 'UTC',
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
  component: Component,
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
