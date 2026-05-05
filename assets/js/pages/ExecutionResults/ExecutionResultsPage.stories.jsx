import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import Component from './ExecutionResultsPage';

import { action } from 'storybook/actions';
const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    catalogs: [],
  },
  reducers: {},
});

const lastExecutionsSlice = createSlice({
  name: 'lastExecutions',
  initialState: {
    executions: {},
  },
  reducers: {},
});

const checksResultsFiltersSlice = createSlice({
  name: 'checksResultsFilters',
  initialState: {
    filters: {},
  },
  reducers: {},
});

const hostListSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts: [],
  },
  reducers: {},
});

const clusterListSlice = createSlice({
  name: 'clustersList',
  initialState: {
    clusters: [],
  },
  reducers: {},
});

export default {
  title: 'Components/ExecutionResultsPage',
  component: Component,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          catalog: catalogSlice.reducer,
          lastExecutions: lastExecutionsSlice.reducer,
          checksResultsFilters: checksResultsFiltersSlice.reducer,
          hostsList: hostListSlice.reducer,
          clustersList: clusterListSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={['/clusters/123/executions']}>
            <Routes>
              <Route
                path="/:targetType/:targetID/executions"
                element={<Story />}
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      );
    },
  ],
  argTypes: {
    targetID: {
      description: 'Identifier for the targetID',
      control: { type: 'text' },
    },
    targetName: {
      description: 'The targetName prop',
      control: { type: 'text' },
    },
    targetType: {
      description: 'The targetType prop',
      control: { type: 'text' },
    },
    target: {
      description: 'The target prop',
      control: { type: 'text' },
    },
    targetHosts: {
      description: 'The targetHosts prop',
      control: { type: 'object' },
    },
    catalogLoading: {
      description: 'The catalogLoading prop',
      control: { type: 'text' },
    },
    catalog: {
      description: 'The catalog prop',
      control: { type: 'object' },
    },
    catalogError: {
      description: 'The catalogError prop',
      control: { type: 'text' },
    },
    executionLoading: {
      description: 'The executionLoading prop',
      control: { type: 'text' },
    },
    executionStarted: {
      description: 'The executionStarted prop',
      control: { type: 'text' },
    },
    executionRunning: {
      description: 'The executionRunning prop',
      control: { type: 'text' },
    },
    executionData: {
      description: 'The executionData prop',
      control: { type: 'text' },
    },
    executionError: {
      description: 'The executionError prop',
      control: { type: 'text' },
    },
    targetSelectedChecks: {
      description: 'The targetSelectedChecks prop',
      control: { type: 'object' },
    },
    savedFilters: {
      description: 'The savedFilters prop',
      control: { type: 'text' },
    },
    onCatalogRefresh: {
      description: 'Callback function invoked when catalog refresh',
      action: 'onCatalogRefresh',
    },
    onLastExecutionUpdate: {
      description: 'Callback function invoked when last execution update',
      action: 'onLastExecutionUpdate',
    },
    onStartExecution: {
      description: 'Callback function invoked when start execution',
      action: 'onStartExecution',
    },
    onSaveFilters: {
      description: 'Callback function invoked when save filters',
      action: 'onSaveFilters',
    },
  },
};

export const Default = {
  args: {
    targetID: '123',
    targetType: 'cluster',
    onCatalogRefresh: action('onCatalogRefresh'),
    onLastExecutionUpdate: action('onLastExecutionUpdate'),
    onStartExecution: action('onStartExecution'),
    onSaveFilters: action('onSaveFilters'),
  },
};
