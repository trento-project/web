import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import Component from './Page';

const hostSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts: [{ id: '123', hostname: 'host-01' }],
  },
  reducers: {},
});

const softwareUpdatesSlice = createSlice({
  name: 'softwareUpdates',
  initialState: {
    softwareUpdates: {
      123: {
        relevant_patches: [],
        loadingPatches: false,
        errors: [],
      },
    },
  },
  reducers: {},
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: 'testuser',
    email: 'test@example.com',
    timezone: 'UTC',
    abilities: [],
  },
  reducers: {},
});

export default {
  title: 'Components/Page',
  component: Component,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          hostsList: hostSlice.reducer,
          softwareUpdates: softwareUpdatesSlice.reducer,
          user: userSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={['/hosts/123/relevant-patches']}>
            <Routes>
              <Route
                path="/hosts/:hostID/relevant-patches"
                element={<Story />}
              />
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
