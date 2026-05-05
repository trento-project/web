import { abilityFactory, hostFactory } from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

import HostSettingsPage from './HostSettingsPage';

const host = hostFactory.build();
const abilities = abilityFactory.buildList(2);

const checksSelectionSlice = createSlice({
  name: 'checksSelection',
  initialState: {
    saving: false,
    cluster: {},
    host: { [host.id]: [] },
  },
  reducers: {},
});

const lastExecutionsSlice = createSlice({
  name: 'lastExecutions',
  initialState: {
    executions: {},
  },
  reducers: {},
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: {
      abilities,
    },
  },
  reducers: {},
});

const hostListSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts: [host],
  },
  reducers: {},
});

export default {
  title: 'Components/HostSettingsPage',
  component: HostSettingsPage,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          hostsList: hostListSlice.reducer,
          checksSelection: checksSelectionSlice.reducer,
          lastExecutions: lastExecutionsSlice.reducer,
          user: userSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={[`/hosts/${host.id}/settings`]}>
            <Routes>
              <Route path="/hosts/:hostID/settings" element={<Story />} />
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
