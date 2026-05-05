import {
  catalogCheckFactory,
  catalogFactory,
  checksExecutionCompletedFactory,
  clusterFactory,
  hostFactory,
} from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import { action } from 'storybook/actions';

import ExecutionResultsPage from './ExecutionResultsPage';

const cluster = clusterFactory.build({
  provider: 'aws',
  type: 'hana_scale_up',
  details: {
    architecture_type: 'classic',
    hana_scenario: 'performance_optimized',
  },
});
const hosts = hostFactory.buildList(2, { cluster_id: cluster.id });

// Create a catalog with multiple checks
const catalogBase = catalogFactory.build();
const multiCheckCatalog = {
  ...catalogBase,
  catalog: {
    [catalogBase.catalog.id]: catalogBase.catalog,
    ...Object.fromEntries(
      Array.from({ length: 4 }, () => {
        const check = catalogCheckFactory.build();
        return [check.id, check];
      })
    ),
  },
};
const catalog = multiCheckCatalog;

const catalogArray = Object.entries(catalog.catalog || {}).map(
  ([id, check]) => ({
    id,
    ...check,
  })
);

// Create base execution with factory defaults, then update check_results to match catalog
const baseExecution = checksExecutionCompletedFactory.build();
const execution = {
  ...baseExecution,
  check_results: catalogArray.slice(0, 5).map((check, index) => {
    const baseResult = baseExecution.check_results?.[index];
    return {
      check_id: check.id,
      result: 'passing',
      agents_check_results: baseResult?.agents_check_results || [],
      expectation_results: baseResult?.expectation_results || [],
    };
  }),
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    data: catalogArray,
    filteredCatalog: catalogArray,
    loading: false,
    error: null,
  },
  reducers: {},
});

const lastExecutionsSlice = createSlice({
  name: 'lastExecutions',
  initialState: {
    [cluster.id]: {
      data: execution,
      loading: false,
      error: null,
    },
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
    hosts,
  },
  reducers: {},
});

const checks = Object.keys(catalog.catalog || {}).slice(0, 5);
const selectedChecksList = checks.slice(0, 3);

const clusterListSlice = createSlice({
  name: 'clustersList',
  initialState: {
    clusters: [{ ...cluster, selected_checks: selectedChecksList }],
  },
  reducers: {},
});

export default {
  title: 'Components/ExecutionResultsPage',
  component: ExecutionResultsPage,
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
          <MemoryRouter initialEntries={[`/clusters/${cluster.id}/executions`]}>
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
      description: 'Type of the target',
      options: ['host', 'cluster'],
      control: { type: 'select' },
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
      control: { type: 'boolean' },
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
      control: { type: 'boolean' },
    },
    executionStarted: {
      description: 'The executionStarted prop',
      control: { type: 'boolean' },
    },
    executionRunning: {
      description: 'The executionRunning prop',
      control: { type: 'boolean' },
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
      control: { type: 'object' },
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

const targetSelectedChecks =
  selectedChecksList.length > 0 ? selectedChecksList : ['check-1', 'check-2'];

export const Default = {
  args: {
    targetID: cluster.id,
    targetType: 'cluster',
    targetName: cluster.name,
    target: { ...cluster, selected_checks: selectedChecksList },
    targetHosts: hosts,
    catalog: catalogArray,
    catalogLoading: false,
    executionLoading: false,
    executionStarted: true,
    executionRunning: false,
    executionData: execution,
    targetSelectedChecks,
    savedFilters: [],
    onCatalogRefresh: action('onCatalogRefresh'),
    onLastExecutionUpdate: action('onLastExecutionUpdate'),
    onStartExecution: action('onStartExecution'),
    onSaveFilters: action('onSaveFilters'),
  },
};
