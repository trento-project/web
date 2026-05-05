import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import {
  hostFactory,
  userFactory,
  relevantPatchFactory,
  abilityFactory,
} from '@lib/test-utils/factories';
import HostRelevantPatches from '.';

const host = hostFactory.build();
const user = userFactory.build();
const patches = relevantPatchFactory.buildList(3);
const abilities = abilityFactory.buildList(3);

const hostSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts: [host],
  },
  reducers: {},
});

const softwareUpdatesSlice = createSlice({
  name: 'softwareUpdates',
  initialState: {
    softwareUpdates: {
      [host.id]: {
        relevant_patches: patches,
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
    username: user.username,
    email: user.email,
    timezone: 'Etc/UTC',
    abilities,
  },
  reducers: {},
});

export default {
  title: 'Components/Page',
  component: HostRelevantPatches,
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
          <MemoryRouter initialEntries={[`/hosts/${host.id}/relevant-patches`]}>
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
