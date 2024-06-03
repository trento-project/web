import React from 'react';
import '@testing-library/jest-dom';

import MockAdapter from 'axios-mock-adapter';
import { toast } from 'react-hot-toast';
import { withState } from '@lib/test-utils';
import { faker } from '@faker-js/faker';

import { networkClient } from '@lib/network';
import { screen, act, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { profileFactory, adminUser } from '@lib/test-utils/factories/users';
import { setUser } from '@state/user';

import ProfilePage from '@pages/Profile';

const axiosMock = new MockAdapter(networkClient);
const PROFILE_URL = '/api/v1/profile';
const TOTP_ENROLLMENT_URL = '/api/v1/profile/totp_enrollment';

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
  });

  it('should show the pre-filled form with profile information', async () => {
    const user = profileFactory.build();

    axiosMock.onGet(PROFILE_URL).reply(200, user);

    const [StatefulProfile] = withState(<ProfilePage />);
    await act(async () => {
      render(StatefulProfile);
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
      render(StatefulProfile);
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
    const user = profileFactory.build();
    const updatedUser = {
      ...user,
      fullname: 'New fullname',
      password_change_requested: true,
    };

    axiosMock
      .onGet(PROFILE_URL)
      .reply(200, user)
      .onPatch(PROFILE_URL)
      .reply(200, updatedUser);

    const [StatefulProfile, store] = withState(<ProfilePage />);
    await act(async () => {
      render(StatefulProfile);
    });

    const testUser = userEvent.setup();

    await testUser.click(screen.getByRole('button', { name: 'Save' }));

    expect(toast.success).toHaveBeenCalledWith('Profile changes saved!');
    const actions = store.getActions();
    const expectedPayload = [setUser(updatedUser)];

    expect(actions).toEqual(expectedPayload);
  });

  it('should pass errors to form when patch call fails', async () => {
    const user = profileFactory.build();

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
      render(StatefulProfile);
    });

    const testUser = userEvent.setup();

    await act(async () => {
      await testUser.click(screen.getByRole('button', { name: 'Save' }));
    });

    await screen.findByText('Error validating fullname');
  });

  it('should dismiss password change toast when password is changed', async () => {
    const user = profileFactory.build();
    const updatedUser = { ...user, password_change_requested: false };

    axiosMock
      .onGet(PROFILE_URL)
      .reply(200, user)
      .onPatch(PROFILE_URL)
      .reply(200, updatedUser);

    const [StatefulProfile, store] = withState(<ProfilePage />);
    await act(async () => {
      render(StatefulProfile);
    });

    const testUser = userEvent.setup();

    await testUser.click(screen.getByRole('button', { name: 'Save' }));

    const actions = store.getActions();
    const expectedActions = [
      {
        type: 'DISMISS_NOTIFICATION',
        payload: {
          id: 'password-change-requested-toast',
        },
      },
    ];
    expect(actions).toEqual(expect.arrayContaining(expectedActions));
  });

  it('should disable the totp enrollment', async () => {
    const user = profileFactory.build({ totp_enabled: true });

    axiosMock
      .onGet(PROFILE_URL)
      .reply(200, user)
      .onDelete(TOTP_ENROLLMENT_URL)
      .reply(204, {});

    const [StatefulProfile, _] = withState(<ProfilePage />);
    await act(async () => {
      render(StatefulProfile);
    });

    const testUser = userEvent.setup();

    await act(async () => {
      await testUser.click(screen.getByRole('switch'));
    });

    await act(async () => {
      await testUser.click(screen.getByText('Disable'));
    });

    expect(toast.success).toHaveBeenCalledWith('TOTP Disabled');
  });

  it('should handle errors during the reset of the totp enrollment', async () => {
    const user = profileFactory.build({ totp_enabled: true });

    axiosMock
      .onGet(PROFILE_URL)
      .reply(200, user)
      .onDelete(TOTP_ENROLLMENT_URL)
      .reply(422, { error: 'some error' });

    const [StatefulProfile, _] = withState(<ProfilePage />);
    await act(async () => {
      render(StatefulProfile);
    });

    const testUser = userEvent.setup();

    await act(async () => {
      await testUser.click(screen.getByRole('switch'));
    });

    await act(async () => {
      await testUser.click(screen.getByText('Disable'));
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Error disabling totp, please refresh your profile.'
    );
  });

  it('should initiate the totp enrollment', async () => {
    const user = profileFactory.build({ totp_enabled: false });

    const totpSecret = faker.string.uuid();

    axiosMock
      .onGet(PROFILE_URL)
      .reply(200, user)
      .onGet(TOTP_ENROLLMENT_URL)
      .reply(200, { secret: totpSecret, secret_qr_encoded: totpSecret });

    const [StatefulProfile, _] = withState(<ProfilePage />);
    await act(async () => {
      render(StatefulProfile);
    });

    const testUser = userEvent.setup();

    await act(async () => {
      await testUser.click(screen.getByRole('switch'));
    });

    expect(screen.getByText(totpSecret)).toBeVisible();
  });

  it('should handle errors during totp enrollment init', async () => {
    const user = profileFactory.build({ totp_enabled: false });

    axiosMock
      .onGet(PROFILE_URL)
      .reply(200, user)
      .onGet(TOTP_ENROLLMENT_URL)
      .reply(422, { errors: 'some errors' });

    const [StatefulProfile, _] = withState(<ProfilePage />);
    await act(async () => {
      render(StatefulProfile);
    });

    const testUser = userEvent.setup();

    await act(async () => {
      await testUser.click(screen.getByRole('switch'));
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Error retrieving totp enrollment information, please refresh profile.'
    );
  });

  it('should verify the totp enrollment', async () => {
    const user = profileFactory.build({ totp_enabled: false });
    const totpSecret = faker.string.uuid();

    axiosMock
      .onGet(PROFILE_URL)
      .reply(200, user)
      .onGet(TOTP_ENROLLMENT_URL)
      .reply(200, { secret: totpSecret, secret_qr_encoded: totpSecret })
      .onPost(TOTP_ENROLLMENT_URL)
      .reply(200, {});

    const [StatefulProfile, _] = withState(<ProfilePage />);
    await act(async () => {
      render(StatefulProfile);
    });

    const testUser = userEvent.setup();

    await act(async () => {
      await testUser.click(screen.getByRole('switch'));
    });

    await act(async () => {
      await testUser.type(screen.getByLabelText('totp_code'), '1234');
      await testUser.click(screen.getByRole('button', { name: 'Verify' }));
    });

    expect(toast.success).toHaveBeenCalledWith('TOTP Enabled');
  });

  it('should handle errors during the verification of totp enrollment', async () => {
    const user = profileFactory.build({ totp_enabled: false });
    const totpSecret = faker.string.uuid();

    axiosMock
      .onGet(PROFILE_URL)
      .reply(200, user)
      .onGet(TOTP_ENROLLMENT_URL)
      .reply(200, { secret: totpSecret, secret_qr_encoded: totpSecret })
      .onPost(TOTP_ENROLLMENT_URL)
      .reply(422, {
        errors: [
          {
            detail: 'Error validating totp code',
            title: 'Invalid value',
          },
        ],
      });

    const [StatefulProfile, _] = withState(<ProfilePage />);
    await act(async () => {
      render(StatefulProfile);
    });

    const testUser = userEvent.setup();

    await act(async () => {
      await testUser.click(screen.getByRole('switch'));
    });

    await act(async () => {
      await testUser.type(screen.getByLabelText('totp_code'), '1234');
      await testUser.click(screen.getByRole('button', { name: 'Verify' }));
    });

    expect(screen.getByText('Error validating totp code')).toBeVisible();
  });
});
