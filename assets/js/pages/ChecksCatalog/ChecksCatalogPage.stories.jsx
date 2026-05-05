import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import Component from './ChecksCatalogPage';

import { action } from 'storybook/actions';
const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    data: [],
    filteredCatalog: false,
    error: null,
    loading: false,
  },
  reducers: {},
});

export default {
  title: 'Components/ChecksCatalogPage',
  component: Component,
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
    completeCatalog: [],
    filteredCatalog: false,
    catalogError: null,
    loading: false,
    updateCatalog: action('updateCatalog'),
  },
};
