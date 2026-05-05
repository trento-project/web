import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { catalogCheckFactory } from '@lib/test-utils/factories';
import ChecksCatalog from '.';

import { action } from 'storybook/actions';

const catalogData = catalogCheckFactory.buildList(10);
const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    data: catalogData,
    filteredCatalog: false,
    error: null,
    loading: false,
  },
  reducers: {},
});

export default {
  title: 'Components/ChecksCatalogPage',
  component: ChecksCatalog,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          catalog: catalogSlice.reducer,
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
    completeCatalog: {
      description: 'The completeCatalog prop',
      control: { type: 'object' },
    },
    filteredCatalog: {
      description: 'The filteredCatalog prop',
      control: { type: 'boolean' },
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
    completeCatalog: catalogData,
    filteredCatalog: false,
    catalogError: null,
    loading: false,
    updateCatalog: action('updateCatalog'),
  },
};
