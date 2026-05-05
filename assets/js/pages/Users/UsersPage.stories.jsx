// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { networkClient } from '@lib/network';
import { userFactory } from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

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
  argTypes: {
    onDeleteUser: {
      description: 'Callback function invoked when delete user',
      action: 'onDeleteUser',
    },
    navigate: {
      description: 'The navigate prop',
      control: { type: 'object' },
    },
    users: {
      description: 'Array of items for the users',
      control: { type: 'object' },
    },
    loading: {
      description: 'The loading prop',
      control: { type: 'boolean' },
    },
    singleSignOnEnabled: {
      description: 'The singleSignOnEnabled prop',
      control: { type: 'text' },
    },
    timezone: {
      description: 'The timezone prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    navigate: action('navigate'),
    users,
    loading: false,
    singleSignOnEnabled: false,
    timezone: 'Etc/UTC',
    onDeleteUser: action('onDeleteUser'),
  },
};

export const Empty = {
  args: {
    ...Default.args,
    users: [],
  },
};

export const Loading = {
  args: {
    ...Default.args,
    loading: true,
  },
};
