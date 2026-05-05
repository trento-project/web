import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';
import Component from './SaptuneDetailsPage';

const hostDetailsSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts: [
      {
        id: '123',
        hostname: 'host-01',
        saptune_status: {
          package_version: '3.1.0',
          configured_version: '3.1.0',
          applied_notes: [{ id: '2205917' }, { id: '2382421' }],
          enabled_notes: [{ id: '2205917' }],
          applied_solution: {
            id: 'SLES15-SAP',
            notes: ['2205917'],
            partial: false,
          },
          enabled_solution: {
            id: 'SLES15-SAP',
            notes: ['2205917'],
            partial: false,
          },
          services: [
            { name: 'saptune', enabled: true, active: true },
            { name: 'sapconf', enabled: false, active: false },
            { name: 'tuned', enabled: true, active: true },
          ],
          staging: {
            enabled: false,
            notes: [],
            solutions_ids: [],
          },
          tuning_state: 'compliant',
        },
      },
    ],
  },
  reducers: {},
});

export default {
  title: 'Components/SaptuneDetailsPage',
  component: Component,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          hostsList: hostDetailsSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={['/hosts/123/saptune']}>
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
    appliedNotes: '',
    appliedSolution: '',
    enabledNotes: '',
    enabledSolution: '',
    configuredVersion: '',
    hostname: '',
    hostID: '',
    packageVersion: '',
    services: '',
    staging: '',
    tuningState: '',
  },
};
