// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { abilityFactory, userFactory } from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

import Layout from './Layout';

const user = userFactory.build();
const abilities = abilityFactory.buildList(2);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: user.username,
    email: user.email,
    abilities,
    timezone: 'Etc/UTC',
    analytics_eula_accepted: true,
  },
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
  title: 'Components/Layout',
  component: Layout,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          user: userSlice.reducer,
          notifications: notificationsSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="*" element={<Story />} />
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
