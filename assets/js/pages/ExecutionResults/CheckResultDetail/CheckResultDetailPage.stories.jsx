import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import Component from './CheckResultDetailPage';

const lastExecutionsSlice = createSlice({
  name: 'lastExecutions',
  initialState: {
    123: {
      data: {
        check_results: [],
      },
    },
  },
  reducers: {},
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    data: [],
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
  title: 'Components/CheckResultDetailPage',
  component: Component,
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
          <MemoryRouter initialEntries={['/results/clusters/123/checks/456']}>
            <Routes>
              <Route
                path="/results/:targetType/:targetID/checks/:checkID"
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
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    checkID: 'check-1',
    expectations: {},
    targetID: 'target-1',
    targetType: 'cluster',
    severity: 'critical',
    executionData: {},
  },
};
