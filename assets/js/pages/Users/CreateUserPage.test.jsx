import React from 'react';

import { render, screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { faker } from '@faker-js/faker';

// eslint-disable-next-line import/no-extraneous-dependencies
import * as router from 'react-router';

import { networkClient } from '@lib/network';

import { abilityFactory, userFactory } from '@lib/test-utils/factories/users';

import CreateUserPage from './CreateUserPage';

const ABILITIES_URL = `/api/v1/abilities`;
const USERS_URL = '/api/v1/users';
const axiosMock = new MockAdapter(networkClient);

describe('CreateUserPage', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should redirect back to users when the Back To Users button is clicked', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);

    render(<CreateUserPage />);

    await user.click(screen.getByRole('button', { name: 'Back to Users' }));

    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('should redirect back to users when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);

    render(<CreateUserPage />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('should save a new user and redirect to users view', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
    const { fullname, email, username } = userFactory.build();
    const password = faker.internet.password();
    const abilities = abilityFactory.buildList(2);

    axiosMock
      .onPost(USERS_URL)
      .reply(202, {})
      .onGet(ABILITIES_URL)
      .reply(200, abilities);

    render(<CreateUserPage />);

    await user.type(screen.getByPlaceholderText('Enter full name'), fullname);
    await user.type(screen.getByPlaceholderText('Enter email address'), email);
    await user.type(screen.getByPlaceholderText('Enter username'), username);
    await user.type(screen.getByPlaceholderText('Enter password'), password);
    await user.type(screen.getByPlaceholderText('Re-enter password'), password);

    await user.click(screen.getByLabelText('permissions'));

    abilities.forEach(({ name, resource }) =>
      expect(screen.getAllByText(`${name}:${resource}`).length).toBe(1)
    );

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('should display validation errors', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
    const { fullname, email, username } = userFactory.build();
    const password = faker.internet.password();

    const errors = [
      {
        detail: 'Error validating fullname',
        source: { pointer: '/fullname' },
        title: 'Invalid value',
      },
    ];

    axiosMock.onPost(USERS_URL).reply(422, { errors });

    render(<CreateUserPage />);

    await user.type(screen.getByPlaceholderText('Enter full name'), fullname);
    await user.type(screen.getByPlaceholderText('Enter email address'), email);
    await user.type(screen.getByPlaceholderText('Enter username'), username);
    await user.type(screen.getByPlaceholderText('Enter password'), password);
    await user.type(screen.getByPlaceholderText('Re-enter password'), password);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await screen.findByText('Error validating fullname');
  });
});
