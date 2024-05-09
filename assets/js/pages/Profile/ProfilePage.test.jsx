import React from 'react';
import '@testing-library/jest-dom';

import MockAdapter from 'axios-mock-adapter';
import { toast } from 'react-hot-toast';

import { networkClient } from '@lib/network';
import { screen, act, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { userFactory } from '@lib/test-utils/factories/users';

import ProfilePage from '@pages/Profile';

const axiosMock = new MockAdapter(networkClient);
const PROFILE_URL = '/api/v1/profile';

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ProfilePage', () => {
  afterEach(() => {
    axiosMock.reset();
    jest.clearAllMocks();
  });

  it('should show the pre-filled form with profile information', async () => {
    const user = userFactory.build();

    axiosMock.onGet(PROFILE_URL).reply(200, user);

    await act(async () => {
      await render(<ProfilePage />);
    });

    expect(await screen.getByLabelText('email').value).toBe(user.email);
    expect(await screen.getByLabelText('username').value).toBe(user.username);
    expect(await screen.getByLabelText('fullname').value).toBe(user.fullname);
  });

  it('should submit the profile form and show a success toast', async () => {
    const user = userFactory.build();

    axiosMock
      .onGet(PROFILE_URL)
      .reply(200, user)
      .onPatch(PROFILE_URL)
      .reply(200, { ...user, fullname: 'New fullname' });

    await act(async () => {
      await render(<ProfilePage />);
    });

    const testUser = userEvent.setup();

    await testUser.click(screen.getByRole('button', { name: 'Save' }));

    expect(toast.success).toHaveBeenCalledWith('Profile changes saved!');
  });

  it('should pass errors to form when patch call fails', async () => {
    const user = userFactory.build();

    const errors = [
      {
        detail: 'Error validating fullname',
        source: { pointer: '/fullname' },
        title: 'Invalid value',
      },
    ];

    axiosMock
      .onGet(PROFILE_URL)
      .reply(200, user)
      .onPatch(PROFILE_URL)
      .reply(422, { errors });

    await act(async () => {
      await render(<ProfilePage />);
    });

    const testUser = userEvent.setup();

    await testUser.click(screen.getByRole('button', { name: 'Save' }));

    await act(async () => {
      await screen.findByText('Error validating fullname');
    });
  });
});
