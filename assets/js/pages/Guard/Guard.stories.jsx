import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import Component from './Guard';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    loggedIn: false,
  },
  reducers: {},
});

export default {
  title: 'Components/Guard',
  component: Component,
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
  argTypes: {
    redirectPath: {
      description: 'The redirectPath prop',
      control: { type: 'text' },
    },
    getUser: {
      description: 'Function to get user data',
      action: 'getUser',
    },
  },
};

export const Default = {
  args: {
    redirectPath: '/login',
    getUser: async () => ({ id: '1', username: 'test' }),
  },
};
