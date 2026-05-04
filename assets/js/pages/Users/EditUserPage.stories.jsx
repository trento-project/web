import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router';
import MockAdapter from 'axios-mock-adapter';
import { networkClient } from '@lib/network';
import Component from './EditUserPage';

export default {
  title: 'Components/EditUserPage',
  component: Component,
  decorators: [
    (Story) => {
      const axiosMock = new MockAdapter(networkClient);
      const now = new Date();
      const pastDate = new Date(now.getTime() - 86400000).toISOString();
      axiosMock.onGet('/api/v1/users/123').reply(200, {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        fullname: 'Test User',
        enabled: true,
        password_change_requested: false,
        totp_enabled: false,
        created_at: pastDate,
        updated_at: now.toISOString(),
        last_login_at: now.toISOString(),
        abilities: [],
      });
      axiosMock.onGet('/abilities').reply(200, [
        { id: '1', name: 'all', resource: 'all' },
        { id: '2', name: 'users:create', resource: 'users' },
        { id: '3', name: 'users:update', resource: 'users' },
        { id: '4', name: 'users:delete', resource: 'users' },
      ]);
      axiosMock.onPut('/api/v1/users/123').reply(200, {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        fullname: 'Test User',
        enabled: true,
      });

      return (
        <MemoryRouter initialEntries={['/users/123/edit']}>
          <Routes>
            <Route path="/users/:userID/edit" element={<Story />} />
          </Routes>
        </MemoryRouter>
      );
    },
  ],
  argTypes: {},
};

export const Default = {
  args: {},
};
