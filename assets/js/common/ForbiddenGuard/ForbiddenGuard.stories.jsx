import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import Component from './ForbiddenGuard';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    abilities: [{ name: 'all', resource: 'all' }],
  },
  reducers: {},
});

export default {
  title: 'Components/ForbiddenGuard',
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
          <Story />
        </Provider>
      );
    },
  ],
  argTypes: {
    permitted: {
      description: 'The permitted prop',
      control: { type: 'object' },
    },
    outletMode: {
      description: 'The outletMode prop',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Whether the component is disabled',
      control: { type: 'boolean' },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    permitted: [],
    outletMode: false,
    disabled: false,
    children: 'Default children',
  },
};

export const WithPermission = {
  args: {
    ...Default.args,
    permitted: ['action:resource'],
    outletMode: false,
    disabled: false,
    children: 'Content with permission',
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    permitted: [],
    outletMode: false,
    disabled: true,
    children: 'Disabled content',
  },
};
