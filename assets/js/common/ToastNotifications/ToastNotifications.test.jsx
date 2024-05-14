import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import { USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID } from '@state/user';

import { getNotification } from './ToastNotifications';

describe('ToastNotifications', () => {
  it('should return password change requested toast notifications', () => {
    const { component, icon } = getNotification({
      id: USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID,
    });

    renderWithRouter(component);
    expect(
      screen.getByText('Password change is recommended', { exact: false })
    ).toBeVisible();

    const { container } = render(icon);
    const svgEl = container.querySelector("[data-testid='eos-svg-component']");
    expect(svgEl.classList.toString()).toContain('fill-yellow-500');
  });
});
