import React from 'react';
import '@testing-library/jest-dom';

import MockAdapter from 'axios-mock-adapter';

import { networkClient } from '@lib/network';
import { screen, act, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { adminUser, userFactory } from '@lib/test-utils/factories/users';
import { renderWithRouter } from '@lib/test-utils';

import UsersPage from './UsersPage';

const axiosMock = new MockAdapter(networkClient);

describe('UsersPage', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  it('should render users page with a table without data.', async () => {
    axiosMock.onGet('/api/v1/users').reply(200, []);
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

  it('should render users page with a table and multiple users', async () => {
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
    const toolTipText = 'Admin user can not be deleted';
    const bannerText = 'This action cannot be undone.';
    const modalWarningText =
      'Are you sure you want to delete the following user account?';
    axiosMock.onGet('/api/v1/users').reply(200, [admin, user]);

    await act(async () => {
      renderWithRouter(<UsersPage />);
    });

    expect(await screen.getByText(admin.username)).toBeVisible();
    expect(await screen.getByText(admin.fullname)).toBeVisible();
    expect(await screen.getByText(admin.email)).toBeVisible();
    expect(await screen.getAllByText('Enabled').length).toBe(1);
    expect(await screen.getByText(exptedCreationTime[0])).toBeVisible();

    expect(await screen.getByText(user.username)).toBeVisible();
    expect(await screen.getByText(user.fullname)).toBeVisible();
    expect(await screen.getByText(user.email)).toBeVisible();
    expect(await screen.getAllByText('Disabled').length).toBe(1);
    expect(await screen.getByText(exptedCreationTime[1])).toBeVisible();

    let deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(2);
    await userEvent.hover(deleteButtons[0]);
    expect(await screen.findByText(toolTipText)).toBeVisible();

    await userEvent.click(deleteButtons[1]);
    expect(await screen.getByText(bannerText)).toBeVisible();
    expect(await screen.getByText(modalWarningText)).toBeVisible();
    expect(screen.getAllByText(user.username)[1]).toBeVisible();

    deleteButtons = screen.getAllByText('Delete');
    userEvent.click(deleteButtons[2]);
    waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
      expect(axiosMock.history.delete[0].url).toBe(`/users/${user.id}`);
    });
  });
});
