// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import {
  hostFactory,
  upgradablePackageFactory,
} from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import { action } from 'storybook/actions';

import UpgradablePackagesPage from './UpgradablePackagesPage';

const host = hostFactory.build();
const upgradablePackages = upgradablePackageFactory.buildList(5);

const hostDetailsSlice = createSlice({
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
        upgradable_packages: upgradablePackages,
        loading: false,
        errors: [],
      },
    },
  },
  reducers: {},
});

export default {
  title: 'Components/UpgradablePackagesPage',
  component: UpgradablePackagesPage,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          hostsList: hostDetailsSlice.reducer,
          softwareUpdates: softwareUpdatesSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter
            initialEntries={[`/hosts/${host.id}/upgradable-packages`]}
          >
            <Routes>
              <Route
                path="/hosts/:hostID/upgradable-packages"
                element={<Story />}
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      );
    },
  ],
  argTypes: {
    hostName: {
      description: 'The hostName prop',
      control: { type: 'text' },
    },
    upgradablePackages: {
      description: 'The upgradablePackages prop',
      control: { type: 'text' },
    },
    patchesLoading: {
      description: 'The patchesLoading prop',
      control: { type: 'text' },
    },
    onPatchClick: {
      description: 'Callback function invoked when patch click',
      action: 'onPatchClick',
    },
    onLoad: {
      description: 'Callback function invoked when load',
      action: 'onLoad',
    },
  },
};

export const Default = {
  args: {
    hostName: host.hostname,
    upgradablePackages,
    patchesLoading: false,
    onPatchClick: action('onPatchClick'),
    onLoad: action('onLoad'),
  },
};
