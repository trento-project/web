import { hostFactory } from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

import SaptuneDetailsPage from './SaptuneDetailsPage';

const host = hostFactory.build();

const hostDetailsSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts: [host],
  },
  reducers: {},
});

export default {
  title: 'Components/SaptuneDetailsPage',
  component: SaptuneDetailsPage,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          hostsList: hostDetailsSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={[`/hosts/${host.id}/saptune`]}>
            <Routes>
              <Route path="/hosts/:hostID/saptune" element={<Story />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );
    },
  ],
  argTypes: {
    appliedNotes: {
      description: 'The appliedNotes prop',
      control: { type: 'text' },
    },
    appliedSolution: {
      description: 'The appliedSolution prop',
      control: { type: 'text' },
    },
    enabledNotes: {
      description: 'The enabledNotes prop',
      control: { type: 'text' },
    },
    enabledSolution: {
      description: 'The enabledSolution prop',
      control: { type: 'text' },
    },
    configuredVersion: {
      description: 'The configuredVersion prop',
      control: { type: 'text' },
    },
    hostname: {
      description: 'The hostname prop',
      control: { type: 'text' },
    },
    hostID: {
      description: 'Identifier for the hostID',
      control: { type: 'text' },
    },
    packageVersion: {
      description: 'The packageVersion prop',
      control: { type: 'text' },
    },
    services: {
      description: 'The services prop',
      control: { type: 'object' },
    },
    staging: {
      description: 'The staging prop',
      control: { type: 'text' },
    },
    tuningState: {
      description: 'The tuningState prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    appliedNotes: host.saptune_status?.applied_notes || [],
    appliedSolution: host.saptune_status?.applied_solution || [],
    enabledNotes: host.saptune_status?.enabled_notes || [],
    enabledSolution: host.saptune_status?.enabled_solution || [],
    configuredVersion: host.saptune_status?.configured_version,
    hostname: host.hostname,
    hostID: host.id,
    packageVersion: host.saptune_status?.package_version,
    services: host.saptune_status?.services || [],
    staging: host.saptune_status?.staging,
    tuningState: host.saptune_status?.tuning_state,
  },
};
