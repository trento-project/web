import React from 'react';
import '@testing-library/jest-dom';

import MockAdapter from 'axios-mock-adapter';

import { networkClient } from '@lib/network';
import { screen, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { adminUser, userFactory } from '@lib/test-utils/factories/users';
import { renderWithRouter } from '@lib/test-utils';

import UsersPage from './UsersPage';

const axiosMock = new MockAdapter(networkClient);

describe('UsersPage', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  it('should render users overview with a table without data.', async () => {
    axiosMock.onGet('/api/v1//users').reply(200, []);
    await act(async () => {
      renderWithRouter(<UsersPage />);
    });
    const headers = [
      'Username',
      'Full Name',
      'Email',
      'Status',
      'Created',
      'Actions',
    ];
    headers.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
    expect(await screen.getByText('No data available')).toBeVisible();
  });

  it('should render users overview with a table, only with the admin user.', async () => {
    const creationTime = '2024-04-22T16:20:57.801758Z';
    const exptedCreationTime = 'April 22, 2024';
    const admin = adminUser.build({ created_at: creationTime });
    axiosMock.onGet('/api/v1/users').reply(200, [admin]);
    await act(async () => {
      renderWithRouter(<UsersPage />);
    });

    expect(await screen.getByText(admin.username)).toBeVisible();
    expect(await screen.getByText(admin.fullname)).toBeVisible();
    expect(await screen.getByText(admin.email)).toBeVisible();
    expect(await screen.getByText(exptedCreationTime)).toBeVisible();
    expect(await screen.getByText(admin.actions)).toBeVisible();

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(1);

    await userEvent.hover(deleteButtons[0]);
    expect(
      await screen.findByText('Admin user can not be deleted')
    ).toBeVisible();
  });

  it('should render users overview with a table and multiple users', async () => {
    const creationTime = [
      '2024-03-22T16:20:57.801758Z',
      '2024-04-22T16:20:57.801758Z',
    ];
    const exptedCreationTime = ['March 22, 2024', 'April 22, 2024'];
    const admin = adminUser.build({
      enabled: true,
      created_at: creationTime[0],
    });
    const user = userFactory.build({
      enabled: false,
      created_at: creationTime[1],
    });

    axiosMock.onGet('/api/v1/users').reply(200, [admin, user]);

    await act(async () => {
      renderWithRouter(<UsersPage />);
    });

    expect(await screen.getByText(admin.username)).toBeVisible();
    expect(await screen.getByText(admin.email)).toBeVisible();
    expect(await screen.getByText(admin.fullname)).toBeVisible();
    expect(await screen.getByText(exptedCreationTime[0])).toBeVisible();
    expect(await screen.getAllByText('Enabled').length).toBe(1);

    expect(await screen.getByText(user.username)).toBeVisible();
    expect(await screen.getByText(user.email)).toBeVisible();
    expect(await screen.getByText(user.fullname)).toBeVisible();
    expect(await screen.getByText(exptedCreationTime[1])).toBeVisible();
    expect(await screen.getAllByText('Disabled').length).toBe(1);

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(2);
    await userEvent.hover(deleteButtons[1]);
    expect(screen.queryByText('Admin user can not be deleted')).toBeNull();
  });
});
