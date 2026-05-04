import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import { networkClient } from '@lib/network';
import Component from './ProfilePage';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: 'testuser',
    email: 'test@example.com',
    fullname: 'Test User',
    abilities: [],
    timezone: 'UTC',
    personal_access_tokens: [],
    analytics_enabled: false,
    analytics_eula_accepted: true,
    totp_enabled: false,
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
  title: 'Components/ProfilePage',
  component: Component,
  decorators: [
    (Story) => {
      const axiosMock = new MockAdapter(networkClient);
      axiosMock.onGet('/profile').reply(200, {
        fullname: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        timezone: 'UTC',
        abilities: [],
        personal_access_tokens: [],
        analytics_enabled: false,
        analytics_eula_accepted: true,
        totp_enabled: false,
      });

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
