import React from 'react';
import { BrowserRouter } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import Component from './UpgradablePackagesPage';

const hostDetailsSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts: [
      {
        id: '123',
        hostname: 'host-01',
      },
    ],
  },
  reducers: {},
});

const softwareUpdatesSlice = createSlice({
  name: 'softwareUpdates',
  initialState: {
    softwareUpdates: {
      123: {
        upgradable_packages: [],
        loading: false,
        errors: [],
      },
    },
  },
  reducers: {},
});

export default {
  title: 'Components/UpgradablePackagesPage',
  component: Component,
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
          <MemoryRouter initialEntries={['/hosts/123/upgradable-packages']}>
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
    hostName: '',
    upgradablePackages: '',
    patchesLoading: '',
  },
};
