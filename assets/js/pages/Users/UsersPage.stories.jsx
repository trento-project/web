import React from 'react';
import { action } from 'storybook/actions';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import Component from './UsersPage';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: {
      timezone: 'UTC',
    },
  },
  reducers: {},
});

export default {
  title: 'Components/UsersPage',
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
    users: [],
    loading: false,
    singleSignOnEnabled: false,
    timezone: 'UTC',
    onDeleteUser: action('onDeleteUser'),
  },
};
