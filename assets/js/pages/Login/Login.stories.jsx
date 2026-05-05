import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import Login from './Login';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    authError: null,
    authInProgress: false,
    loggedIn: false,
  },
  reducers: {},
});

export default {
  title: 'Components/Login',
  component: Login,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          user: userSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter>
            <Story />
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
