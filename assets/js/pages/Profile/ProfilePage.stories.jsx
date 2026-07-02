// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { networkClient } from '@lib/network';
import { profileFactory } from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Provider } from 'react-redux';

import ProfilePage from './ProfilePage';

const userData = profileFactory.build();

const userSlice = createSlice({
  name: 'user',
  initialState: userData,
  reducers: {},
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    toasts: [],
  },
  reducers: {},
});

export default {
  title: 'Components/ProfilePage',
  component: ProfilePage,
  decorators: [
    (Story) => {
      const axiosMock = new MockAdapter(networkClient);
      axiosMock.onGet('/profile').reply(200, userData);

      const mockStore = configureStore({
        reducer: {
          user: userSlice.reducer,
          notifications: notificationsSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <Story />
        </Provider>
      );
    },
  ],
  argTypes: {},
};

export const Default = {
  args: {},
};
