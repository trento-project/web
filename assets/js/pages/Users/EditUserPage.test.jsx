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
import { userFactory } from '@lib/test-utils/factories/users';

import EditUserPage from './EditUserPage';

const usersUrl = '/api/v1/users/';
const axiosMock = new MockAdapter(networkClient);

describe('EditUserPage', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('Back To Users redirects to the users view', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
    const userData = userFactory.build();
    axiosMock.onGet(usersUrl.concat(userData.id)).reply(200, userData);

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });

    await screen.findByText('Edit User');

    await user.click(screen.getByRole('button', { name: 'Back to Users' }));

    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('Cancel button redirects to the users view', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
    const userData = userFactory.build();
    axiosMock.onGet(usersUrl.concat(userData.id)).reply(200, userData);

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });

    await screen.findByText('Edit User');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('shows user not found if the given user ID does not exist', async () => {
    const userID = '1';
    axiosMock.onGet(usersUrl.concat(userID)).reply(404, {});

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userID}/edit`,
    });

    await screen.findByText('Not found');
  });

  it('edits a  user and redirects to users view', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
    const userData = userFactory.build();

    axiosMock
      .onGet(usersUrl.concat(userData.id))
      .reply(200, userData)
      .onPatch(usersUrl.concat(userData.id))
      .reply(204, {});

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });

    await screen.findByText('Edit User');

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('displays validation errors', async () => {
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
      .onGet(usersUrl.concat(userData.id))
      .reply(200, userData)
      .onPatch(usersUrl.concat(userData.id))
      .reply(422, { errors });

    renderWithRouterMatch(<EditUserPage />, {
      path: '/users/:userID/edit',
      route: `/users/${userData.id}/edit`,
    });

    await screen.findByText('Edit User');

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    await screen.findByText('Error validating fullname');
  });

  it('displays user already updated warning banner', async () => {
    const user = userEvent.setup();
    const userData = userFactory.build();

    axiosMock
      .onGet(usersUrl.concat(userData.id))
      .reply(200, userData)
      .onPatch(usersUrl.concat(userData.id))
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
});
