import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import {
  clusterFactory,
  hostFactory,
  checksExecutionCompletedFactory,
  catalogFactory,
} from '@lib/test-utils/factories';
import CheckResultDetailPage from '.';

const cluster = clusterFactory.build();
const execution = checksExecutionCompletedFactory.build();
const hosts = hostFactory.buildList(2, { cluster_id: cluster.id });
const catalogData = catalogFactory.build();

const checkIDs = Object.keys(catalogData.catalog || {});
const checkID = checkIDs.length > 0 ? checkIDs[0] : 'check-1';
const checkData = catalogData.catalog?.[checkID] || {};

// Ensure execution has check_results with the check we're testing
const executionWithCheckResults = {
  ...execution,
  check_results: [
    {
      check_id: checkID,
      result: 'passing',
      agents_check_results: hosts.map((host) => ({
        agent_id: host.id,
        expectation_evaluations: [
          { name: 'test_expectation_1', result: true, type: 'expect' },
          { name: 'test_expectation_2', result: true, type: 'expect' },
        ],
      })),
      ...checkData,
    },
  ],
};

const catalogArray = Object.entries(catalogData.catalog || {}).map(
  ([id, check]) => ({
    id,
    ...check,
  })
);

const lastExecutionsSlice = createSlice({
  name: 'lastExecutions',
  initialState: {
    [cluster.id]: {
      data: executionWithCheckResults,
      loading: false,
      error: null,
    },
  },
  reducers: {},
});

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

const checksSelectionSlice = createSlice({
  name: 'checksSelection',
  initialState: {
    selections: {},
    cluster: {},
    host: {},
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

const clusterListSlice = createSlice({
  name: 'clustersList',
  initialState: {
    clusters: [cluster],
  },
  reducers: {},
});

export default {
  title: 'Components/CheckResultDetailPage',
  component: CheckResultDetailPage,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          lastExecutions: lastExecutionsSlice.reducer,
          checksSelection: checksSelectionSlice.reducer,
          hostsList: hostListSlice.reducer,
          clustersList: clusterListSlice.reducer,
          catalog: catalogSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter
            initialEntries={[
              `/results/clusters/${cluster.id}/checks/${checkID}/cluster/${cluster.name}`,
            ]}
          >
            <Routes>
              <Route
                path="/results/:targetType/:targetID/checks/:checkID/:resultTargetType/:resultTargetName"
                element={<Story />}
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      );
    },
  ],
  argTypes: {
    checkID: {
      description: 'Identifier for the checkID',
      control: { type: 'text' },
    },
    expectations: {
      description: 'The expectations prop',
      control: { type: 'object' },
    },
    targetID: {
      description: 'Identifier for the targetID',
      control: { type: 'text' },
    },
    targetType: {
      description: 'The targetType prop',
      control: { type: 'text' },
    },
    severity: {
      description: 'The severity prop',
      control: { type: 'text' },
    },
    executionData: {
      description: 'The executionData prop',
      control: { type: 'text' },
    },
  },
};

const expectations = checkData.expectations || [
  {
    name: 'expect_test_1',
    value: 'some_value',
    type: 'expect',
    expectations: [
      { name: 'test_expectation_1', type: 'expect' },
      { name: 'test_expectation_2', type: 'expect' },
    ],
  },
];

export const Default = {
  args: {
    checkID: checkID,
    expectations: expectations,
    targetID: cluster.id,
    targetType: 'cluster',
    severity: checkData.severity || 'critical',
    executionData: executionWithCheckResults,
  },
};
