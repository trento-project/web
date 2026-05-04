import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import { networkClient } from '@lib/network';
import Component from './AdvisoryDetailsPage';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: { timezone: 'UTC' },
  },
  reducers: {},
});

const mockStore = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export default {
  title: 'Components/AdvisoryDetailsPage',
  component: Component,
  argTypes: {},
  decorators: [
    (Story) => {
      const axiosMock = new MockAdapter(networkClient);
      axiosMock.onGet(/\/software_updates\/errata_details\/.*/).reply(200, {
        errata_details: {
          issue_date: '2024-01-01T00:00:00Z',
          update_date: '2024-01-15T00:00:00Z',
          synopsis: 'Important Security Update for critical component',
          advisory_status: 'final',
          type: 'Security Advisory',
          description: 'This is a test security advisory for display purposes',
          reboot_suggested: true,
        },
        fixes: [],
        cves: ['CVE-2024-0001'],
        affected_packages: [
          {
            name: 'package-name',
            version: '1.0',
            epoch: '0',
            release: '1.fc39',
            arch_label: 'x86_64',
          },
        ],
        affected_systems: ['all'],
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter
            initialEntries={['/hosts/host-123/advisory/SUSE-23-001']}
          >
            <Routes>
              <Route
                path="/hosts/:hostID/advisory/:advisoryID"
                element={<Story />}
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      );
    },
  ],
};

export const Default = {
  args: {},
};
