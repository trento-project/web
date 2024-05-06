import React from 'react';

import { screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';

// eslint-disable-next-line import/no-extraneous-dependencies
import * as router from 'react-router';

import { networkClient } from '@lib/network';

import { renderWithRouterMatch } from '@lib/test-utils';
import { adminUser, userFactory } from '@lib/test-utils/factories/users';

import EditUserPage from './EditUserPage';

const USERS_URL = '/api/v1/users/';
const axiosMock = new MockAdapter(networkClient);

describe('EditUserPage', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should redirect back to users when the Back To Users button is clicked', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
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
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
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
  });

  it('should edit a user and redirect to users view', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
    const userData = userFactory.build();

    axiosMock
      .onGet(USERS_URL.concat(userData.id))
      .reply(200, userData)
      .onPatch(USERS_URL.concat(userData.id))
      .reply(204, {});

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });

    await screen.findByText('Edit User');

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(navigate).toHaveBeenCalledWith('/users');
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

    await user.click(screen.getByRole('button', { name: 'Edit' }));

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

    await user.click(screen.getByRole('button', { name: 'Edit' }));

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

    await screen.findByText('Edit User');

    const editButton = screen.getByRole('button', { name: 'Edit' });
    expect(editButton).toBeDisabled();
    const toolTipText = 'Admin user cannot be edited';
    await user.hover(editButton);
    expect(await screen.findByText(toolTipText)).toBeVisible();
  });
});
