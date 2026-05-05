// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { abilityFactory } from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';

import ForbiddenGuard from './ForbiddenGuard';

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });

const userSlice = createSlice({
  name: 'user',
  initialState: {
    abilities: [allAbility],
  },
  reducers: {},
});

export default {
  title: 'Components/ForbiddenGuard',
  component: ForbiddenGuard,
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
      control: { type: 'boolean' },
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
