import React from 'react';
import '@testing-library/jest-dom';

import MockAdapter from 'axios-mock-adapter';
import { toast } from 'react-hot-toast';
import { withState } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import { screen, act, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { userFactory, adminUser } from '@lib/test-utils/factories/users';
import { setUser } from '@state/user';

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

    const [StatefulProfile] = withState(<ProfilePage />);
    await act(async () => {
      await render(StatefulProfile);
    });

    expect(await screen.getByLabelText('email').value).toBe(user.email);
    expect(await screen.getByLabelText('username').value).toBe(user.username);
    expect(await screen.getByLabelText('fullname').value).toBe(user.fullname);
  });

  it('should show the pre-filled form with profile information but disable the form is the user is the default admin', async () => {
    const user = adminUser.build();

    axiosMock.onGet(PROFILE_URL).reply(200, user);

    const [StatefulProfile] = withState(<ProfilePage />);
    await act(async () => {
      await render(StatefulProfile);
    });

    expect(await screen.getByLabelText('email').value).toBe(user.email);
    expect(await screen.getByLabelText('username').value).toBe(user.username);
    expect(await screen.getByLabelText('fullname').value).toBe(user.fullname);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Change Password' })
    ).toBeDisabled();
  });

  it('should submit the profile form and show a success toast', async () => {
    const user = userFactory.build();

    axiosMock
      .onGet(PROFILE_URL)
      .reply(200, user)
      .onPatch(PROFILE_URL)
      .reply(200, { ...user, fullname: 'New fullname' });

    const [StatefulProfile, store] = withState(<ProfilePage />);
    await act(async () => {
      await render(StatefulProfile);
    });

    const testUser = userEvent.setup();

    await testUser.click(screen.getByRole('button', { name: 'Save' }));

    expect(toast.success).toHaveBeenCalledWith('Profile changes saved!');
    const actions = store.getActions();
    const expectedPayload = [setUser({ ...user, fullname: 'New fullname' })];

    expect(actions).toEqual(expectedPayload);
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

    const [StatefulProfile] = withState(<ProfilePage />);
    await act(async () => {
      await render(StatefulProfile);
    });

    const testUser = userEvent.setup();

    await act(async () => {
      await testUser.click(screen.getByRole('button', { name: 'Save' }));
    });

    await screen.findByText('Error validating fullname');
  });
});
