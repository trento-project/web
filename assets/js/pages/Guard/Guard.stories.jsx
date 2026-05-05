import React from 'react';
import { action } from 'storybook/actions';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import { userFactory } from '@lib/test-utils/factories';
import Guard from '.';

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
