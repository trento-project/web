// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { catalogCheckFactory } from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

import ChecksCatalogPage from './ChecksCatalogPage';

const catalogData = catalogCheckFactory.buildList(10);
const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    data: catalogData,
    error: null,
    loading: false,
  },
  reducers: {},
});

export default {
  title: 'Components/ChecksCatalogPage',
  component: ChecksCatalogPage,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          catalog: catalogSlice.reducer,
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
    catalog: {
      description: 'Catalog checks',
      control: { type: 'object' },
    },
    catalogError: {
      description: 'The catalogError prop',
      control: { type: 'text' },
    },
    loading: {
      description: 'The loading prop',
      control: { type: 'boolean' },
    },
    updateCatalog: {
      description: 'Callback function invoked to update catalog',
      action: 'updateCatalog',
    },
  },
};

export const Default = {
  args: {
    catalog: catalogData,
    catalogError: null,
    loading: false,
    updateCatalog: action('updateCatalog'),
  },
};
