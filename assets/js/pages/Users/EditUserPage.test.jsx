import React from 'react';

import { screen } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import 'intersection-observer';
import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';

// eslint-disable-next-line import/no-extraneous-dependencies
import * as router from 'react-router';

import { networkClient } from '@lib/network';

import { renderWithRouterMatch } from '@lib/test-utils';
import {
  abilityFactory,
  adminUser,
  userFactory,
} from '@lib/test-utils/factories/users';

import EditUserPage from './EditUserPage';

const ABILITIES_URL = `/api/v1/abilities`;
const USERS_URL = '/api/v1/users/';
const TOAST_ERROR_MESSAGE = 'Unexpected error occurred, refresh the page';
const axiosMock = new MockAdapter(networkClient);

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: jest.fn(),
}));

describe('EditUserPage', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should redirect back to users when the Back To Users button is clicked', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    router.useNavigate.mockImplementation(() => navigate);
    const userData = userFactory.build();
    axiosMock.onGet(USERS_URL.concat(userData.id)).reply(200, userData);

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });

    await screen.findByText('Edit User');

    await user.click(screen.getByRole('button', { name: 'Back to Users' }));

    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('should redirect back to users when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    router.useNavigate.mockImplementation(() => navigate);
    const userData = userFactory.build();
    axiosMock.onGet(USERS_URL.concat(userData.id)).reply(200, userData);

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });

    await screen.findByText('Edit User');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('should show user not found if the given user ID does not exist', async () => {
    const userID = '1';
    axiosMock.onGet(USERS_URL.concat(userID)).reply(404, {});

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userID}/edit`,
    });

    await screen.findByText('Not found');
    expect(toast.error).toHaveBeenCalledWith(TOAST_ERROR_MESSAGE);
  });

  it('should edit a user and redirect to users view', async () => {
    const toastMessage = 'User edited successfully';
    const user = userEvent.setup();
    const navigate = jest.fn();
    router.useNavigate.mockImplementation(() => navigate);
    const userData = userFactory.build();
    const abilities = abilityFactory.buildList(2);

    axiosMock
      .onGet(USERS_URL.concat(userData.id))
      .reply(200, userData)
      .onGet(ABILITIES_URL)
      .reply(200, abilities)
      .onPatch(USERS_URL.concat(userData.id))
      .reply(204, {});

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });

    await screen.findByText('Edit User');

    await user.click(screen.getByLabelText('permissions'));

    abilities.forEach(({ name, resource }) =>
      expect(screen.getAllByText(`${name}:${resource}`).length).toBe(1)
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(navigate).toHaveBeenCalledWith('/users');
    expect(toast.success).toHaveBeenCalledWith(toastMessage);
  });

  it('should display validation errors', async () => {
    const user = userEvent.setup();
    const userData = userFactory.build();

    const errors = [
      {
        detail: 'Error validating fullname',
        source: { pointer: '/fullname' },
        title: 'Invalid value',
      },
    ];

    axiosMock
      .onGet(USERS_URL.concat(userData.id))
      .reply(200, userData)
      .onPatch(USERS_URL.concat(userData.id))
      .reply(422, { errors });

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });

    await screen.findByText('Edit User');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await screen.findByText('Error validating fullname');
  });

  it('should display user already updated warning banner', async () => {
    const user = userEvent.setup();
    const userData = userFactory.build();

    axiosMock
      .onGet(USERS_URL.concat(userData.id))
      .reply(200, userData)
      .onPatch(USERS_URL.concat(userData.id))
      .reply(412, {});

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });

    await screen.findByText('Edit User');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await screen.findByText('Information has been updated by another user', {
      exact: false,
    });
  });

  it('should not enable editing if the user is admin', async () => {
    const user = userEvent.setup();
    const userData = adminUser.build();

    axiosMock.onGet(USERS_URL.concat(userData.id)).reply(200, userData);

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });

    const generatePasswordButton = await screen.findByText('Generate Password');
    expect(generatePasswordButton).toBeDisabled();

    await screen.findByText('Edit User');

    const editButton = screen.getByRole('button', { name: 'Save' });
    expect(editButton).toBeDisabled();
    const toolTipText = 'Admin user cannot be edited';
    await user.hover(editButton);
    expect(await screen.findByText(toolTipText)).toBeVisible();
  });

  it('should render toast with an error message when editing a user failed because of a network error', async () => {
    const user = userEvent.setup();
    const userData = userFactory.build();

    axiosMock
      .onGet(USERS_URL.concat(userData.id))
      .reply(200, userData)
      .onPatch(USERS_URL.concat(userData.id))
      .networkError();

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });
    await screen.findByText('Edit User');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(toast.error).toHaveBeenCalledWith(TOAST_ERROR_MESSAGE);
  });
});
