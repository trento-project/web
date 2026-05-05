import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import Component from './HostSettingsPage';

const checksSelectionSlice = createSlice({
  name: 'checksSelection',
  initialState: {
    saving: false,
    cluster: {},
    host: { 123: [] },
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
      abilities: [],
    },
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

export default {
  title: 'Components/HostSettingsPage',
  component: Component,
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
          <MemoryRouter initialEntries={['/hosts/123/settings']}>
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
