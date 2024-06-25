import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import { USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID } from '@state/user';

import { getNotification } from './ToastNotifications';

describe('ToastNotifications', () => {
  it('should return password change requested toast notification', () => {
    const component = getNotification({
      id: USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID,
    });

    renderWithRouter(component);
    expect(
      screen.getByText('Password change is recommended', { exact: false })
    ).toBeVisible();
  });
});
