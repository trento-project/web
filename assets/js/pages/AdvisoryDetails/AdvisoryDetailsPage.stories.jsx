// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { networkClient } from '@lib/network';
import { advisoryErrataFactory } from '@lib/test-utils/factories/advisoryErrata';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

import AdvisoryDetailsPage from './AdvisoryDetailsPage';

const errata = advisoryErrataFactory.build();

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: { timezone: 'Etc/UTC' },
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
  component: AdvisoryDetailsPage,
  argTypes: {},
  decorators: [
    (Story) => {
      const axiosMock = new MockAdapter(networkClient);
      axiosMock
        .onGet(/\/software_updates\/errata_details\/.*/)
        .reply(200, errata);

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
