import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import Component from './Layout';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: 'testuser',
    email: 'test@example.com',
    abilities: [],
    timezone: 'UTC',
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
  component: Component,
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
