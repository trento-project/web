// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { networkClient } from '@lib/network';
import { userFactory } from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import UsersPage from './UsersPage';

const users = userFactory.buildList(3);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: {
      timezone: 'Etc/UTC',
    },
  },
  reducers: {},
});

export default {
  title: 'Components/UsersPage',
  component: UsersPage,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          user: userSlice.reducer,
        },
      });

      const axiosMock = new MockAdapter(networkClient);
      axiosMock.onGet('/users').reply(200, users);

      return (
        <Provider store={mockStore}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </Provider>
      );
    },
  ],
};

export const Default = {
  args: {},
};
