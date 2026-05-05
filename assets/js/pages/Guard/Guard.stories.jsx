import { userFactory } from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import Guard from './Guard';

const user = userFactory.build();

const userSlice = createSlice({
  name: 'user',
  initialState: {
    loggedIn: true,
    username: user.username,
    email: user.email,
  },
  reducers: {},
});

const mockGetUser = () => Promise.resolve(user);

export default {
  title: 'Components/Guard',
  component: Guard,
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
    getUser: mockGetUser,
  },
};
