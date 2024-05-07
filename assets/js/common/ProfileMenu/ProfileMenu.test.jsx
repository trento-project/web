import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { userFactory } from '@lib/test-utils/factories/users';

import ProfileMenu from './ProfileMenu';

describe('ProfileMenu component', () => {
  test('should render a profile menu button with username', () => {
    const { email, username } = userFactory.build();
    const { getByText } = render(
      <ProfileMenu username={username} email={email} />
    );
    const usernameElement = getByText(username);
    expect(usernameElement).toBeInTheDocument();
  });

  test('should render a profile menu with email when opened', async () => {
    const user = userEvent.setup();

    const { email, username } = userFactory.build();
    const { getByText, getByRole } = render(
      <ProfileMenu username={username} email={email} />
    );
    await user.click(getByRole('button'));
    const emailElement = getByText(email);
    expect(emailElement).toBeInTheDocument();
  });

  test('should trigger logout when sign out button is clicked', async () => {
    const user = userEvent.setup();

    const logoutMock = jest.fn();
    const { email, username } = userFactory.build();
    const { getByText, getByRole } = render(
      <ProfileMenu username={username} email={email} logout={logoutMock} />
    );

    await user.click(getByRole('button'));
    const signOutButton = getByText('Sign out');
    await user.click(signOutButton);
    expect(logoutMock).toHaveBeenCalled();
  });
});
