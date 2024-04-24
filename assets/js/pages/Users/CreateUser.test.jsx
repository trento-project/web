import React from 'react';

import { render, screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';

/* eslint-disable import/no-extraneous-dependencies */
import * as router from 'react-router';

import { networkClient } from '@lib/network';

import { userFactory } from '@lib/test-utils/factories/users';

import CreateUser from './CreateUser';

const usersUrl = '/api/v1/users';
const axiosMock = new MockAdapter(networkClient);

describe('UserForm', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('Back To Users redirects to the users view', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);

    render(<CreateUser />);

    await user.click(screen.getByRole('button', { name: 'Back to Users' }));

    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('Cancel button redirects to the users view', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);

    render(<CreateUser />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('saves a new user and redirects to users view', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
    const { fullname, email, username, password } = userFactory.build();

    axiosMock.onPost(usersUrl).reply(202, {});

    render(<CreateUser />);

    await user.type(screen.getByPlaceholderText('Enter full name'), fullname);
    await user.type(screen.getByPlaceholderText('Enter email address'), email);
    await user.type(screen.getByPlaceholderText('Enter username'), username);
    await user.type(screen.getByPlaceholderText('Enter password'), password);
    await user.type(screen.getByPlaceholderText('Re-enter password'), password);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('displays validation errors', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
    const { fullname, email, username, password } = userFactory.build();

    const errors = [
      {
        detail: 'Error validating fullname',
        source: { pointer: '/fullname' },
        title: 'Invalid value',
      },
    ];

    axiosMock.onPost(usersUrl).reply(422, { errors });

    render(<CreateUser />);

    await user.type(screen.getByPlaceholderText('Enter full name'), fullname);
    await user.type(screen.getByPlaceholderText('Enter email address'), email);
    await user.type(screen.getByPlaceholderText('Enter username'), username);
    await user.type(screen.getByPlaceholderText('Enter password'), password);
    await user.type(screen.getByPlaceholderText('Re-enter password'), password);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await screen.findByText('Error validating fullname');
  });
});
