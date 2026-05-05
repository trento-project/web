import React from 'react';
import { action } from 'storybook/actions';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import { abilityFactory } from '@lib/test-utils/factories';
import ActivityLogPage from '.';

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });

const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState: {
    users: [],
  },
  reducers: {},
});

const userProfileSlice = createSlice({
  name: 'user',
  initialState: {
    abilities: [allAbility],
    timezone: 'Etc/UTC',
  },
  reducers: {},
});

export default {
  title: 'Components/ActivityLogPage',
  component: ActivityLogPage,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          activityLog: activityLogSlice.reducer,
          user: userProfileSlice.reducer,
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
    request: {
      description: 'The request prop',
      control: { type: 'text' },
    },
    itemsPerPage: {
      description: 'Array of items for the itemsPerPage',
      control: { type: 'object' },
    },
    onPageChange: {
      description: 'Callback function invoked when page change',
      action: 'onPageChange',
    },
    onChangeItemsPerPage: {
      description: 'Callback function invoked when change items per page',
      action: 'onChangeItemsPerPage',
    },
    timezone: {
      description: 'The timezone prop',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Whether the component is disabled',
      control: { type: 'boolean' },
    },
    rate: {
      description: 'The rate prop',
      control: { type: 'text' },
    },
    onChange: {
      description: 'Callback function invoked when change',
      action: 'onChange',
    },
  },
};

export const Default = {
  args: {
    request: {},
    itemsPerPage: [10, 25, 50],
    timezone: 'Etc/UTC',
    disabled: false,
    rate: 5000,
    onPageChange: action('onPageChange'),
    onChangeItemsPerPage: action('onChangeItemsPerPage'),
    onChange: action('onChange'),
  },
};
