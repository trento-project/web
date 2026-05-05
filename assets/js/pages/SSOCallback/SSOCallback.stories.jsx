import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import SSOCallback from '.';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    authError: null,
    loggedIn: false,
  },
  reducers: {},
});

export default {
  title: 'Components/SSOCallback',
  component: SSOCallback,
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
