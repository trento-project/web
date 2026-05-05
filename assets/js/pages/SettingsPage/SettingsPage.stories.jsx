import { networkClient } from '@lib/network';
import { abilityFactory, userFactory } from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Provider } from 'react-redux';

import SettingsPage from './SettingsPage';

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });
const user = userFactory.build();

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: user.username,
    email: user.email,
    abilities: [allAbility],
    timezone: 'Etc/UTC',
  },
  reducers: {},
});

const activityLogsSettingsSlice = createSlice({
  name: 'activityLogsSettings',
  initialState: {
    settings: {
      enabled: false,
      retention_days: 30,
    },
    errors: null,
    loading: false,
    editing: false,
    networkError: null,
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

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    toasts: [],
  },
  reducers: {},
});

export default {
  title: 'Components/SettingsPage',
  component: SettingsPage,
  decorators: [
    (Story) => {
      const axiosMock = new MockAdapter(networkClient);
      axiosMock.onGet('/settings/suse_manager').reply(404);
      axiosMock.onGet('/settings/alerting').reply(404);
      axiosMock
        .onGet('/settings/api_key')
        .reply(200, { generated_api_key: null, expire_at: null });

      const mockStore = configureStore({
        reducer: {
          user: userSlice.reducer,
          activityLogsSettings: activityLogsSettingsSlice.reducer,
          hostsList: hostListSlice.reducer,
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
  argTypes: {
    apiKeyExpiration: {
      description: 'Identifier for the apiKeyExpiration',
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
    apiKeyExpiration: '2026-12-31T23:59:59Z',
    timezone: 'Etc/UTC',
  },
};
