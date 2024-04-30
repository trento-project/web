import React from 'react';
import '@testing-library/jest-dom';

import MockAdapter from 'axios-mock-adapter';
import { toast } from 'react-hot-toast';

import { networkClient } from '@lib/network';
import { screen, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { adminUser, userFactory } from '@lib/test-utils/factories/users';
import { renderWithRouter } from '@lib/test-utils';

import UsersPage from './UsersPage';

const axiosMock = new MockAdapter(networkClient);

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UsersPage', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    axiosMock.reset();
    jest.clearAllMocks();
  });

  it('should render table without data', async () => {
    axiosMock.onGet('/api/v1/users').reply(200, []);
    await act(async () => {
      renderWithRouter(<UsersPage />);
    });
    expect(await screen.getByText('No data available')).toBeVisible();
  });

  it('should render table with users', async () => {
    const admin = adminUser.build();
    const user = userFactory.build();

    axiosMock.onGet('/api/v1/users').reply(200, [admin, user]);

    await act(async () => {
      renderWithRouter(<UsersPage />);
    });

    expect(await screen.getByText(admin.username)).toBeInTheDocument();
    expect(await screen.getByText(user.username)).toBeInTheDocument();
  });

  it('should render toast with failing message when fetching users failed', async () => {
    const fetchErrorMessage = 'An error occurred: Fetching users failed';
    axiosMock.onGet('/api/v1/users').reply(404);
    await act(async () => {
      renderWithRouter(<UsersPage />);
    });
    expect(toast.error).toHaveBeenCalledWith(fetchErrorMessage);
  });

  it('should render toast with success message when deleting was successfully', async () => {
    const admin = adminUser.build();
    const user = userFactory.build();

    const deleteMessage = 'User deleted successfully';

    axiosMock
      .onGet('/api/v1/users')
      .reply(200, [admin, user])
      .onDelete(`/api/v1/users/${user.id}`)
      .reply(204);

    await act(async () => {
      renderWithRouter(<UsersPage />);
    });

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(2);
    await userEvent.click(deleteButtons[1]);
    const modalDeleteButton = screen.getAllByText('Delete')[2];
    await userEvent.click(modalDeleteButton);

    expect(axiosMock.history.delete.length).toBe(1);
    expect(axiosMock.history.delete[0].url).toBe(`/users/${user.id}`);
    expect(toast.success).toHaveBeenCalledWith(deleteMessage);
  });

  it('should render toast with error message when deleting failed', async () => {
    const admin = adminUser.build({});
    const user = userFactory.build({});
    const userNotFoundMessage = 'An error occurred: User not found';
    axiosMock.onGet('/api/v1/users').reply(200, [admin, user]);
    axiosMock.onDelete(`/api/v1/users/${user.id}`).reply(404);

    await act(async () => {
      renderWithRouter(<UsersPage />);
    });

    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[1]);
    const modalDeleteButton = screen.getAllByText('Delete')[2];
    await userEvent.click(modalDeleteButton);

    expect(axiosMock.history.delete.length).toBe(1);
    expect(axiosMock.history.delete[0].url).toBe(`/users/${user.id}`);
    expect(toast.error).toHaveBeenCalledWith(userNotFoundMessage);
  });
});
