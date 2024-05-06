import React from 'react';
import { render, fireEvent } from '@testing-library/react';
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

  test('should render a profile menu with email when opened', () => {
    const { email, username } = userFactory.build();
    const { getByText, getByRole } = render(
      <ProfileMenu username={username} email={email} />
    );
    const button = getByRole('button');
    fireEvent.click(button);
    const emailElement = getByText(email);
    expect(emailElement).toBeInTheDocument();
  });

  test('should trigger logout when sign out button is clicked', () => {
    const logoutMock = jest.fn();
    const { email, username } = userFactory.build();
    const { getByText, getByRole } = render(
      <ProfileMenu username={username} email={email} logout={logoutMock} />
    );
    const button = getByRole('button');
    fireEvent.click(button);
    const signOutButton = getByText('Sign out');
    fireEvent.click(signOutButton);
    expect(logoutMock).toHaveBeenCalled();
  });
});
